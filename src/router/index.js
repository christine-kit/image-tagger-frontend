import { createRouter, createWebHistory } from 'vue-router'
import AddImage from '../views/AddImage.vue'
import DisplayImage from '../views/DisplayImage.vue'
import Search from '../views/Search.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/search',
        component: Search,
    },
    {
        path: '/image/:id',
        component: DisplayImage,
        props: true,
    },
    {
        path: '/addimage',
        component: AddImage
    },
  ],
})

export default router