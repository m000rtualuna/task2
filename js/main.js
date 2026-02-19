Vue.component('first-column', {
    props: ['cards'],
    template: `
        <div class="column">
            <h2>Первая колонка</h2>
            <card v-for="card in cards" :key="card.id" :card="card" @update-card="$emit('update-card', $event)"></card>
        </div>
    `
})

Vue.component('second-column', {
    props: ['cards'],
    template: `
        <div class="column">
            <h2>Вторая колонка</h2>
            <card v-for="card in cards" :key="card.id" :card="card" @update-card="$emit('update-card', $event)"></card>
        </div>
    `
})

Vue.component('third-column', {
    props: ['cards'],
    template: `
        <div class="column">
            <h2>Третья колонка</h2>
            <card v-for="card in cards" :key="card.id" :card="card" @update-card="$emit('update-card', $event)"></card>
        </div>
    `
})


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
            const columns = [this.firstColumnCards, this.secondColumnCards, this.thirdColumnCards];
            for (const col of columns) {
                const idx = col.findIndex(c => c.id === updatedCard.id);
                if (idx !== -1) {
                    col.splice(idx, 1, updatedCard);
                    break;
                }
            }
        },

        addNewCard() {
            // Проверяем количество карточек
            if (this.firstColumnCards.length >= 3) {
                alert('Нельзя добавить больше 3 карточек в первый столбец.');
                return; // Выходим, не добавляя новую карточку
            }

            const title = prompt('Заголовок карточки');
            if (!title) return; // если заголовок не введён — сразу выйти

            const items = [];
            let i = 1;

            // Минимум 3 элемента — обязательный ввод
            while (i <= 3) {
                let text = '';
                do {
                    text = prompt(`Элемент ${i} (обязательно, минимум 3 элемента)`);
                    if (!text) alert('Поле не может быть пустым. Пожалуйста, введите текст.');
                } while (!text);

                items.push({ text, done: false });
                i++;
            }

            // Можно добавить еще элементы, максимум до 5
            while (i <= 5) {
                const cont = confirm('Добавить еще элемент?');
                if (!cont) break; // пользователь не хочет добавлять

                const text = prompt(`Элемент ${i}`);
                if (!text) break; // отмена или пустая строка - прекращаем ввод

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