Vue.component('column', {
    props: ['title', 'cards'],
    template: `
    <div class="column">
      <h2>{{ title }}</h2>
      <card 
        v-for="card in cards" 
        :key="card.id" 
        :card="card" 
        @update-card="$emit('update-card', $event)"
      ></card>
    </div>
  `
});


Vue.component('card', {
    props: {
        card: Object,
    },

    template: `
        <div>
        <h3>{{ card.title }}</h3>
        <ul>
          <li v-for="(item, index) in card.items" :key="index">
            <label>
              <input type="checkbox" v-model="item.done" @change="onCheckBoxChange">
              {{ item.text }}
            </label>
          </li>
        </ul>
        </div>
    `,

    methods: {
        onCheckBoxChange() {
            this.$emit('update-card', this.card);
        }
        },
})


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
            completed: false
        }
    },

    methods: {
        updateCard(updatedCard) {
            function getProgress(card) {
                const total = card.items.length;
                const doneCount = card.items.filter(i => i.done).length;
                return total ? (doneCount / total) : 0;
            }

            const progress = getProgress(updatedCard);

            const firstIdx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
            if (firstIdx !== -1) {
                this.firstColumnCards.splice(firstIdx, 1, updatedCard);

                if (progress > 0.5) {
                    const [movedCard] = this.firstColumnCards.splice(firstIdx, 1);
                    this.secondColumnCards.push(movedCard);
                }
                return;
            }

            const secondIdx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
            if (secondIdx !== -1) {
                this.secondColumnCards.splice(secondIdx, 1, updatedCard);

                if (progress === 1) {
                    const [movedCard] = this.secondColumnCards.splice(secondIdx, 1);
                    this.thirdColumnCards.push(movedCard);
                }
                return;
            }

            const thirdIdx = this.thirdColumnCards.findIndex(c => c.id === updatedCard.id);
            if (thirdIdx !== -1) {
                this.thirdColumnCards.splice(thirdIdx, 1, updatedCard);
            }
        },

        addNewCard() {
            if (this.firstColumnCards.length >= 3) {
                alert("You can't add more than 3 cards :(");
                return;
            }

            const title = prompt('Card title');
            if (!title) return;

            const items = [];
            let i = 1;

            while (i <= 3) {
                let text = '';
                do {
                    text = prompt(`Task ${i} `);
                    if (!text) alert('Please enter the task');
                } while (!text);

                items.push({ text, done: false });
                i++;
            }

            while (i <= 5) {
                const cont = confirm('Add a task?');
                if (!cont) break;

                const text = prompt(`Task ${i}`);
                if (!text) break;

                items.push({ text, done: false });
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
        }
    }
});