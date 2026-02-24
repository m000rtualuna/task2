Vue.component('column', {
    props: ['title', 'cards', 'checkAllowed'],
    template: `
    <div class="column">
      <h2>{{ title }}</h2>
      <div v-if="cards.length === 0">
        <p>Здесь пока ничего нет</p>
      </div>
      <div class="cards" @dragover.prevent
           @drop="onDrop">
        <card v-for="card in cards" :key="card.id" :card="card" :checkAllowed="checkAllowed"
              @update-card="$emit('update-card', $event)"
              @drag-start="onDragStart"
              @drop="onCardDrop">
        </card>
      </div>
    </div>
  `,
    data() {
        return {
            draggedCard: null
        };
    },
    methods: {
        onDragStart(card) {
            this.draggedCard = card;
        },
        onCardDrop({ targetCard }) {
            if (this.draggedCard && this.draggedCard !== targetCard) {
                const indexDragged = this.cards.findIndex(c => c.id === this.draggedCard.id);
                const indexTarget = this.cards.findIndex(c => c.id === targetCard.id);
                this.cards.splice(indexDragged, 1);
                this.cards.splice(indexTarget, 0, this.draggedCard);
                this.draggedCard = null;
                this.$emit('update-order', this.cards);
            }
        },
        onDrop() {
            this.draggedCard = null;
        }
    }
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
    <div class="card" draggable="true"
         @dragstart="onDragStart"
         @dragover.prevent
         @drop="onDrop">
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

            const itemsCopy = this.card.items.map(i => {
                if (i === item) return {...i, done: newValue};
                return i;
            });

            const total = itemsCopy.length;
            const doneCount = itemsCopy.filter(i => i.done).length;
            const newProgress = total ? doneCount / total : 0;

            if (!this.checkAllowed(this.card, item, newProgress)) {
                alert('Пункт нельзя отметить, так как во второй колонке нет места');
                event.target.checked = !newValue;
                return;
            }

            this.$set(item, 'done', newValue);
            this.$emit('update-card', this.card);
        },

        onDragStart() {
            this.$emit('drag-start', this.card);
        },

        onDrop(event) {
            this.$emit('drop', { targetCard: this.card });
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
                const progress = getProgress(updatedCard);
                if (progress >= 0.5) {
                    if (this.secondColumnCards.length >= 5) {
                        alert('Во второй колонке уже максимальное количество списков (5)');
                        this.$set(this.firstColumnCards, this.firstColumnCards.findIndex(c => c.id === updatedCard.id), { ...updatedCard, completedAt: null });
                    } else {
                        const idx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
                        const movedCard = this.firstColumnCards.splice(idx, 1)[0];
                        this.secondColumnCards.push({ ...movedCard, completedAt: null });
                    }
                }
                this.saveData();
                return;
            }

            if (updateInArray(this.secondColumnCards, updatedCard)) {
                const progress = getProgress(updatedCard);
                const idx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);

                if (progress === 1) {
                    const movedCard = this.secondColumnCards.splice(idx, 1)[0];
                    const cardWithDate = { ...movedCard, completedAt: new Date().toLocaleString() };
                    this.thirdColumnCards.push(cardWithDate);

                } else if (progress < 0.5) {
                    if (this.firstColumnCards.length >= 3) {
                        alert('В первой колонке уже максимальное количество списков (3)');
                        this.$set(this.secondColumnCards, idx, { ...updatedCard, completedAt: null });
                    } else {
                        const movedCard = this.secondColumnCards.splice(idx, 1)[0];
                        this.firstColumnCards.push({ ...movedCard, completedAt: null });
                    }
                } else {
                    this.$set(this.secondColumnCards, idx, { ...updatedCard, completedAt: null });
                }
                this.saveData();
                return;
            }

            if (updateInArray(this.firstColumnCards, updatedCard)) {
                const progress = getProgress(updatedCard);
                if (progress >= 0.5) {
                    if (this.secondColumnCards.length >= 5) {
                        alert('Во второй колонке уже максимальное количество списков (5)');
                        this.$set(this.firstColumnCards, this.firstColumnCards.findIndex(c => c.id === updatedCard.id), { ...updatedCard, completedAt: null });
                    } else {
                        const idx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
                        const movedCard = this.firstColumnCards.splice(idx, 1)[0];
                        this.secondColumnCards.push({ ...movedCard, completedAt: null });
                    }
                }
                this.saveData();
                return;
            }

            if (updateInArray(this.thirdColumnCards, updatedCard)) {
                const progress = getProgress(updatedCard);
                const idx = this.thirdColumnCards.findIndex(c => c.id === updatedCard.id);

                if (progress < 1) {
                    if (this.secondColumnCards.length >= 5) {
                        alert('Во второй колонке уже максимальное количество списков (5)');
                        return;
                    } else {
                        const idx3 = idx;
                        const movedCard = this.thirdColumnCards.splice(idx3, 1)[0];
                        this.secondColumnCards.push({ ...movedCard, completedAt: null });
                    }
                } else {
                    const date = new Date().toLocaleString();
                    this.$set(this.thirdColumnCards, idx, { ...updatedCard, completedAt: date });
                }
                this.saveData();
                return;
            }
        },

        checkAllowed(card, item, newProgress) {
            const inFirstColumn = this.firstColumnCards.some(c => c.id === card.id);
            const inSecondColumn = this.secondColumnCards.some(c => c.id === card.id);
            const inThirdColumn = this.thirdColumnCards.some(c => c.id === card.id);
            if (inThirdColumn && !inFirstColumn && this.secondColumnCards.length >= 5 && newProgress < 1) {
                return false;
            }
            if (inSecondColumn && inFirstColumn === false && this.firstColumnCards.length >= 3 && newProgress < 0.5) {
                return false;
            }
            if (inFirstColumn && this.secondColumnCards.length >= 5 && newProgress >= 0.5) {
                return false;
            }
            return true;
        },

        handleUpdateOrder(columnName, newOrder) {
            this[columnName] = newOrder;
            this.saveData();
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