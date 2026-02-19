Vue.component('column', {
    props: ['title', 'cards', 'checkAllowed'],
    template: `
    <div class="column">
      <h2>{{ title }}</h2>
      <card 
        v-for="card in cards" 
        :key="card.id" 
        :card="card" 
        :checkAllowed="checkAllowed"
        @update-card="$emit('update-card', $event)"
      ></card>
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
    <div>
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(item, index) in card.items" :key="index">
          <label>
            <input 
              type="checkbox" 
              :checked="item.done" 
              @click.prevent="onCheckBoxClick(item)"
            >
            {{ item.text }}
          </label>
        </li>
      </ul>
      <p v-if="card.completedAt" class="completed-info">Завершено: {{ card.completedAt }}</p>
    </div>
  `,

    methods: {
        onCheckBoxClick(item) {
            if (!this.checkAllowed(this.card, item)) {
                alert('Ошибка: Вы не можете отметить этот пункт');
                return;
            }
            item.done = !item.done;
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
        newCard: {
            id: null,
            title: '',
            description: '',
        }
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
            function getProgress(card) {
                const total = card.items.length;
                const doneCount = card.items.filter(i => i.done).length;
                return total ? (doneCount / total) : 0;
            }

            const progress = getProgress(updatedCard);

            let firstIdx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
            if (firstIdx !== -1) {
                if (progress > 0.5) {
                    if (this.secondColumnCards.length >= 5) {
                        alert('Во второй колонке уже максимальное количество списков (5)');
                        this.firstColumnCards.splice(firstIdx, 1, updatedCard);
                        updatedCard.completedAt = null;
                    } else {
                        updatedCard.completedAt = null;
                        const [movedCard] = this.firstColumnCards.splice(firstIdx, 1);
                        this.secondColumnCards.push(movedCard);
                    }
                }
                this.saveData();
                return;
            }

            let secondIdx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
            if (secondIdx !== -1) {
                if (progress === 1) {
                    updatedCard.completedAt = new Date().toLocaleString();
                    const [movedCard] = this.secondColumnCards.splice(secondIdx, 1);
                    this.thirdColumnCards.push(movedCard);
                } else {
                    this.secondColumnCards.splice(secondIdx, 1, updatedCard);
                    updatedCard.completedAt = null;
                }
                this.saveData();
                return;
            }

            let thirdIdx = this.thirdColumnCards.findIndex(c => c.id === updatedCard.id);
            if (thirdIdx !== -1) {
                updatedCard.completedAt = updatedCard.completedAt || new Date().toLocaleString();
                this.thirdColumnCards.splice(thirdIdx, 1, updatedCard);
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
                    text = prompt(`Пункт ${i} `);
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
                status: 'one'
            };

            this.firstColumnCards.push(newCard);
            this.saveData();
        },

        checkAllowed(card, item) {
            const inFirst = this.firstColumnCards.find(c => c.id === card.id);
            const inSecond = this.secondColumnCards.find(c => c.id === card.id);

            if (inFirst && this.secondColumnCards.length >= 5) {
                alert('Нельзя отметить пункт, пока в колонке "В работе" 5 карточек');
                return false;
            }
            if (inSecond && this.firstColumnCards.length >= 3) {
                alert('Нельзя отметить пункт, пока в колонке "Нужно сделать" 3 карточки');
                return false;
            }
            return true;
        }
    }
});