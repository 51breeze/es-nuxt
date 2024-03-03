import web.Application
import web.components.Viewport;
import web.ui.Layout
import web.ui.Body;
class App extends Application{

    @Main
    static main(){
        when( Env(platform, 'server') ){
            System.setConfig('http.request.baseURL', 'http://127.0.0.1:8000');
            console.log('----server:host----',  'http://127.0.0.1:8000/api'  )
        }then{
            System.setConfig('http.request.baseURL', '/api');
            console.log('----client:host----',  '/api'  )
        }

        console.log('----------app---------')

        if( !System.hasRegisterHook('httpRequestCreated') ){
            System.registerHook('httpRequestCreated', (request)=>{
                request.interceptors.response.use((res)=>{
                    if( res && res.status === 200 ){
                        return res.data;
                    }else{
                        return {};
                    }
                })
            });
        }
    }

    @Override
    render(h){
        console.log('----------App.es render----------------')
        return <Layout name="custom">
            <Viewport />
        </Layout>
    }
}