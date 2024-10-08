package stores;
import web.Store
class ProfileStore extends Store{

    userId = 0

    static use(){
        return Store.use(ProfileStore)
    }
}
