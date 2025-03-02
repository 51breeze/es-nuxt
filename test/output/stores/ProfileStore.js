import Class from "./../Class.js";
import Store from "./../web/Store.js";
const _private = Class.getKeySymbols("4511a6d9");
function ProfileStore(){
    Store.apply(this,arguments);
    this.userId=0;
    Object.defineProperty(this,_private,{
        value:{}
    });
}
Class.creator(ProfileStore,{
    m:513,
    ns:"stores",
    name:"ProfileStore",
    private:_private,
    inherit:Store,
    methods:{
        use:{
            m:800,
            value:function use(){
                return Store.use(ProfileStore);
            }
        }
    },
    members:{
        userId:{
            m:520,
            writable:true,
            enumerable:true
        }
    }
});
export default ProfileStore;