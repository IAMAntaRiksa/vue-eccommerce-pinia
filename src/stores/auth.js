import { defineStore } from 'pinia'
import Api from '../api/api'
import { useCartStore } from '@/stores/cart'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || "",
    }),
    getters: {
        iUser: (state) => state.token,
        isLoggedIn: (state) => state.token != false
    },
    actions: {
        async getUser() {
            try {
                const token = localStorage.getItem('token')
                const { data } = await Api.get('/user', {
                    headers: {
                        Authorization: 'Bearer' + token
                    }
                });
                this.token = data
            } catch (error) {
                console.log(error)
            }
        },

        async logout() {
            const token = localStorage.getItem('token')
            const store = useCartStore()
            return new Promise((resolve, reject) => {
                Api.post('logout', {}, {
                    headers: {
                        Authorization: 'Bearer' + token
                    }
                }).then(() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    store.carts = 0
                    this.token = ""
                })

                resolve()
            });
        },

        login(credential) {
            const store = useCartStore()

            return new Promise((resolve, reject) => {
                Api.post('login', credential).then((response) => {

                    localStorage.setItem('token', response.data.data.token)
                    localStorage.setItem('user', JSON.stringify(response.data.data.user))

                    store.cartCount()
                    this.token = true
                    resolve()
                }).catch((error) => {
                    reject(error.response.data)
                });
            });
        },

        register(credential) {
            return new Promise((resolve, reject) => {
                Api.post('register', credential).then((response) => {

                    const token = response.data.data.token
                    const user = response.data.data.user

                    localStorage.setItem('token', token)
                    localStorage.setItem('user', JSON.stringify(user))

                    Api.defaults.headers.common['Authorization'] = "Bearer " + token

                    resolve()
                }).catch((error) => {
                    reject(error.response.data)
                });
            });
        }
    },
})
