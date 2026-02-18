Vue.component('column', {

    template: `
    <div class="column">
    <card></card>
</div>`,

    data() {
        return {
            column: [],
            columns: ['first', 'second', 'third'],
            cards: []
        }
    },

    methods: {

    }
});


Vue.component('card', {
    props: {
    column: Array
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
            title: null,
            description: null,
            isFull: false
        }
    },

    methods: {
        onSubmit() {
        if (this.column.length <= 3 ) {
        let card = {
            name: this.name,
            review: this.review,
            rating: this.rating,
            recommendation: this.recommendation,
        };
    }
}

    }
});


let app = new Vue({
    el: '#app',
    data: {
    },

    methods: {
    }
});