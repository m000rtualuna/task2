Vue.component('column', {
    props: ['title', 'cards', 'checkAllowed'],
    template: `
    <div class="column">
      <h2>{{ title }}</h2>
      <div v-if="cards.length === 0">
        <p>Здесь пока ничего нет</p>
      </div>
      <card v-for="card in cards" :key="card.id" :card="card" :checkAllowed="checkAllowed"@update-card="$emit('update-card', $event)"></card>
    </div>
  `
});


Vue.component('card', {
    props: {
        card: Object,
        checkAllowed: {
            type: Function,
            default: () => () => true
        }
    },

    template: `
    <div class="card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, index) in card.items" :key="index">
          <label>
            <input type="checkbox" :checked="item.done" @change="onCheckBoxChange(item, $event)">
            {{ item.text }}
          </label>
        </li>
      </ul>
      <p v-if="card.completedAt" class="completed-info">Завершено: {{ card.completedAt }}</p>
    </div>
  `,

    methods: {
        onCheckBoxChange(item, event) {
            const newValue = event.target.checked;
            if (item.done && !newValue) {
                alert('Вы не можете снять отметку с этого пункта');
                event.target.checked = true;
                return;
            }

            const itemsCopy = this.card.items.map(i => {
                if (i === item) return {...i, done: newValue};
                return i;
            });

            const total = itemsCopy.length;
            const doneCount = itemsCopy.filter(i => i.done).length;
            const newProgress = total ? doneCount / total : 0;

            if (!this.checkAllowed(this.card, item, newProgress)) {
                alert('Ошибка. Пункт нельзя отметить, так как во второй колонке нет места.');
                event.target.checked = !newValue;
                return;
            }

            this.$set(item, 'done', newValue);
            this.$emit('update-card', this.card);
        }
    }
});


let app = new Vue({
    el: '#app',
    data: {
        firstColumnCards: [],
        secondColumnCards: [],
        thirdColumnCards: [],
        newCardTitle: '',
        newCardItems: ['','',''],
    },

    created() {
        const savedFirst = localStorage.getItem('firstColumnCards');
        const savedSecond = localStorage.getItem('secondColumnCards');
        const savedThird = localStorage.getItem('thirdColumnCards');

        if (savedFirst) this.firstColumnCards = JSON.parse(savedFirst);
        if (savedSecond) this.secondColumnCards = JSON.parse(savedSecond);
        if (savedThird) this.thirdColumnCards = JSON.parse(savedThird);
    },

    methods: {
        saveData() {
            localStorage.setItem('firstColumnCards', JSON.stringify(this.firstColumnCards));
            localStorage.setItem('secondColumnCards', JSON.stringify(this.secondColumnCards));
            localStorage.setItem('thirdColumnCards', JSON.stringify(this.thirdColumnCards));
        },

        updateCard(updatedCard) {
            const getProgress = card => {
                const total = card.items.length;
                const doneCount = card.items.filter(i => i.done).length;
                return total ? doneCount / total : 0;
            };

            const progress = getProgress(updatedCard);

            const withCompletedAt = (card, date) => ({ ...card, completedAt: date });

            const updateInArray = (arr, card) => {
                const idx = arr.findIndex(c => c.id === card.id);
                if (idx !== -1) {
                    this.$set(arr, idx, card);
                    return true;
                }
                return false;
            };

            if (updateInArray(this.firstColumnCards, updatedCard)) {
                if (progress >= 0.5) {
                    if (this.secondColumnCards.length >= 5) {
                        alert('Во второй колонке уже максимальное количество списков (5)');
                        const cardNullDate = withCompletedAt(updatedCard, null);
                        this.$set(this.firstColumnCards, this.firstColumnCards.findIndex(c => c.id === updatedCard.id), cardNullDate);
                    } else {
                        const idx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
                        const movedCard = this.firstColumnCards.splice(idx, 1)[0];
                        const movedCardReset = withCompletedAt(movedCard, null);
                        this.secondColumnCards.push(movedCardReset);
                    }
                }
                this.saveData();
                return;
            }

            if (updateInArray(this.secondColumnCards, updatedCard)) {
                if (progress === 1) {
                    const cardWithDate = withCompletedAt(updatedCard, new Date().toLocaleString());
                    const idx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
                    const movedCard = this.secondColumnCards.splice(idx, 1)[0];
                    const movedCardWithDate = withCompletedAt(movedCard, new Date().toLocaleString());
                    this.thirdColumnCards.push(movedCardWithDate);
                } else {
                    const cardNullDate = withCompletedAt(updatedCard, null);
                    const idx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
                    this.$set(this.secondColumnCards, idx, cardNullDate);
                }
                this.saveData();
                return;
            }

            const idx3 = this.thirdColumnCards.findIndex(c => c.id === updatedCard.id);
            if (idx3 !== -1) {
                const date = updatedCard.completedAt || new Date().toLocaleString();
                const cardWithDate = withCompletedAt(updatedCard, date);
                this.$set(this.thirdColumnCards, idx3, cardWithDate);
                this.saveData();
            }
        },


        checkAllowed(card, item, newProgress) {
            const inFirstColumn = this.firstColumnCards.some(c => c.id === card.id);

            if (newProgress === undefined) {
                const total = card.items.length;
                const doneCount = card.items.filter(i => i.done).length;
                newProgress = total ? doneCount / total : 0;
            }

            if (inFirstColumn && this.secondColumnCards.length >= 5 && newProgress >= 0.5) {
                return false;
            }

            return true;
        },

        submitNewCard() {
            if (this.firstColumnCards.length >= 3) {
                alert("Вы не можете добавить список, пока количество списков в первой колонке равно 3");
                return;
            }

            if (!this.newCardTitle.trim()) return alert('Введите заголовок');

            for (let i = 0; i < this.newCardItems.length; i++) {
                if (!this.newCardItems[i].trim()) {
                    return alert(`Заполните Пункт ${i + 1}`);
                }
            }

            const items = this.newCardItems.map(text => ({ text: text.trim(), done: false }));

            const newCard = {
                id: Date.now(),
                title: this.newCardTitle.trim(),
                items,
                progress: 0,
                status: 'one',
                completedAt: null,
            };

            this.firstColumnCards.push(newCard);
            this.saveData();

            this.newCardTitle = '';
            this.newCardItems = ['', '', ''];
        },
    }
});