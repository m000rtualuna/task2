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
    <form class="card-form" @submit.prevent="onSubmit">
         <p>
           <label for="title">Заголовок:</label>
           <input id="title" v-model="title" placeholder="title">
         </p>
        
         <p>
           <label for="description">Описание:</label>
           <textarea id="description" v-model="description"></textarea>
         </p>
        
         <p>
           <input type="submit" value="Submit"> 
         </p>
    </form>`,

    data() {
        return {
            title: this.card.title || '', // берем из props.card
            description: this.card.description || '',
            isFull: false
        };
    },

    methods: {
        onSubmit() {
            this.$emit('update-card', {
                ...this.card,
                title: this.title,
                description: this.description
            });

            alert('Карточка сохранена!');
        }
    }
})


let app = new Vue({
    el: '#app',
    data: {
        firstColumnCards: [],
        secondColumnCards: [],
        thirdColumnCards: [],
        newCard: {
            id:null,
            title: '',
            description: '',
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

        addNewCard(cardData) {
            if (!cardData.title) {
                alert('Введите заголовок');
                return;
            }

            // Создаем уникальный ID для новых карточек (можно улучшить, если нужно)
            const newId = Date.now();

            // Создаем новую карточку с уникальным ID
            const newCard = {
                id: newId,
                title: cardData.title,
                description: cardData.description,
            };

            // Добавляем карточку в первую колонку (можно изменить на другую)
            this.firstColumnCards.push(newCard);

            // Очищаем форму создания новой карточки
            this.newCard.title = '';
            this.newCard.description = '';

            alert('Новая карточка добавлена!');
        }
    }
});