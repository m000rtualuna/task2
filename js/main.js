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
      <p v-if="card.completedAt" class="completed-info">{{ card.completedAt }}</p>
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
            if (!this.checkAllowed(this.card, item)) {
                alert('Ошибка. Пункт нельзя отметить');
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

            const updateInArray = (arr) => {
                const idx = arr.findIndex(c => c.id === updatedCard.id);
                if (idx !== -1) {
                    this.$set(arr, idx, {...updatedCard});
                    return true;
                }
                return false;
            };

            if (updateInArray(this.firstColumnCards)) {
                if (progress >= 0.5) {
                    if (this.secondColumnCards.length >= 5) {
                        alert('Во второй колонке уже максимальное количество списков (5)');
                        updatedCard.completedAt = null;
                        this.$set(this.firstColumnCards, this.firstColumnCards.findIndex(c => c.id === updatedCard.id), updatedCard);
                    } else {
                        updatedCard.completedAt = null;
                        const idx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
                        const movedCard = this.firstColumnCards.splice(idx,1)[0];
                        this.secondColumnCards.push(movedCard);
                    }
                }
                this.saveData();
                return;
            }

            if (updateInArray(this.secondColumnCards)) {
                if (progress === 1) {
                    updatedCard.completedAt = new Date().toLocaleString();
                    const idx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
                    const movedCard = this.secondColumnCards.splice(idx,1)[0];
                    this.thirdColumnCards.push(movedCard);
                } else {
                    const idx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
                    updatedCard.completedAt = null;
                    this.$set(this.secondColumnCards, idx, updatedCard);
                }
                this.saveData();
                return;
            }

            const idx3 = this.thirdColumnCards.findIndex(c => c.id === updatedCard.id);
            if (idx3 !== -1) {
                updatedCard.completedAt = updatedCard.completedAt || new Date().toLocaleString();
                this.$set(this.thirdColumnCards, idx3, updatedCard);
                this.saveData();
            }
        },

        addNewCard() {
            if (this.firstColumnCards.length >= 3 || this.secondColumnCards.length >= 5) {
                alert("Вы не можете добавить список, пока количество списков в первой колонке равно 3 или количество списков во второй колонке равно 5");
                return;
            }

            const title = prompt('Заголовок списка');
            if (!title) return;

            const items = [];
            let i = 1;

            while (i <= 3) {
                let text = '';
                do {
                    text = prompt(`Пункт ${i}`);
                    if (!text) alert('Пожалуйста, введите пункт списка');
                } while (!text);

                items.push({text, done: false});
                i++;
            }

            while (i <= 5) {
                const cont = confirm('Добавить пункт?');
                if (!cont) break;
                const text = prompt(`Пункт ${i}`);
                if (!text) break;
                items.push({text, done: false});
                i++;
            }

            const newCard = {
                id: Date.now(),
                title,
                items,
                progress: 0,
                status: 'one',
                completedAt: null,
            };

            this.firstColumnCards.push(newCard);
            this.saveData();
        },

        checkAllowed(card, item) {
            const inFirstColumn = this.firstColumnCards.some(c => c.id === card.id);
            if (inFirstColumn && this.secondColumnCards.length >= 5) {
                return false;
            }
            return true;
        },
    }
});