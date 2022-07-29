//商城Vuex-action
export default{
    saveUserName(context,username){
        context.commit('saveUserName',username)
    },
    saveCartCount(context,cartcount){
        context.commit('saveCartCount',cartcount)
    },
    SET_TOKEN(context,token){
        context.commit('SET_TOKEN',token)
    }
}