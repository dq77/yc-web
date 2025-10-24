import { createRouter, createWebHistory } from 'vue-router'
import work from '../views/work/work.vue'
// import welcome from '../views/welcome.vue'
import Layout from '../layout/index.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Layout,
      children: [
        // {
        //   path: '',
        //   redirect: '/work',
        //   name: 'welcome',
        //   // component: welcome,
        // },
        {
          path: '/work2',
          name: 'work2',
          component: () => import('../views/work/work2.vue'),
        },
        {
          path: '/work/wordClip/clipResult',
          name: 'clipResult',
          component: () => import('../views/wordClip/clipResult.vue'),
        },
        {
          path: '/work/wordClip/textEdit',
          name: 'textEdit',
          component: () => import('../views/wordClip/textEdit.vue'),
        },
        {
          path: '/work/wordClip/upload',
          name: 'wordClip',
          component: () => import('../views/wordClip/upload.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../layout/404.vue')
    }
  ],
})

export const asyncRoute = [
    {
      path: 'work',
      name: 'work',
      component: work,
    },
    {
      path: 'account',
      name: 'account',
      component: () => import('../views/account/account.vue'),
    },
    {
      path: 'role',
      name: 'role',
      component: () => import('../views/role/role.vue'),
    },
    {
      path: 'roleAdd',
      name: 'roleAdd',
      component: () => import('../views/role/roleDetail.vue'),
    },
    {
      path: 'roleEdit',
      name: 'roleEdit',
      component: () => import('../views/role/roleDetail.vue'),
    },
    {
      path: 'history',
      name: 'history',
      component: () => import('../views/history/history.vue'),
    },
]

export default router
