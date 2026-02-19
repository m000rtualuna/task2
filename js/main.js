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

            const firstIdx = this.firstColumnCards.findIndex(c => c.id === updatedCard.id);
            if (firstIdx !== -1) {

                if (progress > 0.5) {
                    const [movedCard] = this.firstColumnCards.splice(firstIdx, 1);
                    this.secondColumnCards.push(movedCard);
                    }
                this.saveData();
                return;
            }

            const secondIdx = this.secondColumnCards.findIndex(c => c.id === updatedCard.id);
            if (secondIdx !== -1) {
                this.secondColumnCards.splice(secondIdx, 1, updatedCard);

                if (progress === 1) {
                    const [movedCard] = this.secondColumnCards.splice(secondIdx, 1);
                    this.thirdColumnCards.push(movedCard);
                }
                this.saveData();
                return;
            }

            const thirdIdx = this.thirdColumnCards.findIndex(c => c.id === updatedCard.id);
            if (thirdIdx !== -1) {
                this.thirdColumnCards.splice(thirdIdx, 1, updatedCard);
            }
            this.saveData();
        },

        addNewCard() {
            if (this.firstColumnCards.length >= 3 || this.secondColumnCards.length >= 5) {
                alert("You cannot add a card until there are three cards in the first column or five cards in the second column:(");
                return;
            }

            const title = prompt('Card title');
            if (!title) return;

            const items = [];
            let i = 1;

            while (i <= 3) {
                let text = '';
                do {
                    text = prompt(`Note ${i} `);
                    if (!text) alert('Please enter the note');
                } while (!text);

                items.push({ text, done: false });
                i++;
            }

            while (i <= 5) {
                const cont = confirm('Add a note?');
                if (!cont) break;

                const text = prompt(`Note ${i}`);
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
            this.saveData();
        }
    }
});