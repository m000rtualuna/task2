Vue.component('first-column', {

    template: `
    <div class="first-column">
    <h2>First column</h2>
    </div>`,

    data() {
    },

    methods: {

    }
})


Vue.component('second-column', {
    template: `
    <div class="second-column">
        <h2>Second column</h2>
    </div>
    `
})


Vue.component('third-column', {
    template: `
    <div class="third-column">
        <h2>Third column</h2>
    </div>
    `
})


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
        firstColumnCards: [],
        secondColumnCards: [],
        thirdColumnCards: [],
    },

    methods: {
    }
});