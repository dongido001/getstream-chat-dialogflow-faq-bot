<template> 
    <div class="chat-box">
        <div class="client-messages ">
            <div
                class="chat-message" 
                v-for="message in messages" 
                v-bind:key="message.id"
                v-bind:class="[(message.user.id == userId) ? 'from-client' : 'from-admin']"
            >
                {{ message.text }}
            </div>
        </div>
        <div class="input-container">
            <input
                class="chat-input" 
                type="text" 
                placeholder="enter message..." 
                v-model="message"
                v-on:keyup.enter="addMessage"
            >
        </div>
    </div>
</template>

<script>
export default {
    props: ['messages', 'userId'],
    data() {
        return {
            message: ""
        }
    },
    methods: {
        addMessage() {
            this.$emit('new-message', this.message);
            this.message = "";
        }
    }
}
</script>