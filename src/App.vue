<template>
  <div id="app">
    <div>
      <img alt="Vue logo" src="./assets/logo.png">
    </div>
    <div class="chat-container">
      <div class="head" @click="displayChatArea=!displayChatArea">
        <div style="justify-self: center;"> FAQx </div>
      </div>
      <div v-if="displayChatArea">
        <login
          v-if="!authenticated" 
          v-on:authenticated="setAuthenticated" 
        />
        <messages 
          v-else 
          v-on:new-message="sendMessage"
          :messages="messages"
          :userId="userId"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { StreamChat } from 'stream-chat';
import axios from 'axios';

import Messages from '@/components/Messages.vue';
import Login from '@/components/Login.vue';

import './App.css';

export default {
  name: 'app',
  components: {
    Messages,
    Login
  },
  data: function () {
    return {
      authenticated: false,
      roomId: "",
      messages: [],
      userId: "",
      displayChatArea: false,
      channel: null,
      token: null,
      client: null
    }
  },
  methods: {
   async initializeClient () {
      const client = new StreamChat(process.env.VUE_APP_KEY);

      await client.setUser(
        {
          id: this.userId,
          name: this.userId,
          role: 'admin'
        },
        this.token,
      );

      this.client = client
    },
    async initializeChannel () {
      const channel = this.client.channel('commerce', this.userId, {
        name: 'Customer Support',
      });

      this.channel = channel

      // fetch the channel state, subscribe to future updates
      let state = await channel.watch();

      this.messages = state.messages

      channel.on('message.new', event => {
        this.messages.push(event.message)
      });
    },
    async setAuthenticated(userId) {
      const response = await axios.post(`${process.env.VUE_APP_SERVER}/login`, {userId})
      
      if (response.data.status === 'success') {
        this.authenticated = true
        this.token = response.data.token
        this.userId = userId

        await this.initializeClient()

        await this.initializeChannel()
      }
    },
    async sendMessage (message) {
      this.channel && await this.channel.sendMessage({
        text: message
      });
    },
  },
}
</script>