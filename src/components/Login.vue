<template>
    <div class="login-container chat-box">
        <div class="inputs">
            <input type="text" placeholder="your username" v-model="username">
        </div>
        <button type="submit" class="submit" v-on:click="login"> Submit </button>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            username: "",
        }
    },
    methods: {
        login() {
            this.$emit("authenticated", this.username);
        }
    }
}
</script>