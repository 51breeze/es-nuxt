package pages;
import web.components.Page;
import web.components.Component;
// import {ElButton} from 'element-plus/es/components/button'
// import 'element-plus/es/components/button/style/css.mjs'

// import * as ElementPlusIconsVue from "@element-plus/icons-vue"
// import * as Vue from "vue"
// import Icon from "../icon.js";


import net.Http;
import components.List;
import web.components.Viewport

import stores.ProfileStore;


//import api.http.Account

@Router('person')
class Person extends Page{
    
    @Reactive
    private data:{name:string} = {name:'====222222222===='}


    onClick(e){
        console.log(e)
    }

    private lang:string = 'sss';

    @Override
    async onInitialized(){


        await new Promise( (resolve)=>{
            setTimeout(()=>{
                resolve(null);
                ProfileStore.use().userId = 99
            }, 1000)
            
        });

        console.log( '----onInitialized----person' )

        this.data.name = "===6666666-9999--222--"

        this.withContext(()=>{

            useSeoMeta({
                title:'EaseScript Nuxt'
            })

            useServerSeoMeta({
                title:'EaseScript Nuxt'
            })

        })

      
       

        //var bs:api.http.Account

        //  const data3 = await useAsyncData('sss3333', ()=>{
        //     return new Promise((resolve, reject)=>{
        //         setTimeout(()=>{
        //             resolve({data:'======yejun 33333=========='});
        //         },5000)
        //     })
        // });

        // console.log(data3)

       // type T1 = typeof await @Http(Account, index)

    //    const {data, error, refresh} = await this.useAsyncData(@Router(api.http.Account, index));
    //    if(data.value && data.value ){
    //         this.data4 = data.value.data;
    //    }
      
    }

    @Reactive
    private data2:{[key:string]} = {}

     @Reactive
    private data4:{[key:string]:any, msg?:string} = {select:1}



    @Override
    protected render(){

        console.log( ProfileStore.use().userId,'--999-333-' )

        var params = {id:60}

        //const MyIcon = Icon as web.components.Component;
        return <div xmlns:local="components" xmlns:d="@directives" xmlns:s="@slots" xmlns:ui="web.ui" class="login-container">

            <ui:Meta content="sfdsfdsfds"></ui:Meta>
            <h6>{this.data.name}</h6>

            <ui:Button>
                <ui:Icon name="Plus" />button 222
            </ui:Button>

            <ui:Select b:value={data4.select}>
                <ui:Option value={1} label={"one"} >one</ui:Option>
                <ui:Option value={2} label={"two"} >two</ui:Option>
            </ui:Select>


            <ui:Link to="/">Index</ui:Link>
            <ui:Link to={@Router(pages.members.Profile, param=params)}>profile</ui:Link>
             <ui:Link to={@Router(pages.Address)}>Address</ui:Link>
             
            <div>===6666 ==</div>
            <div>Load data: {data4.msg}</div>
            <List>
                <div>List children</div>
            </List>
            <ui:ClientOnly fallback="fallback">
               
                <s:fallback>
                    <div>=======5555===</div>
                </s:fallback>
                
            </ui:ClientOnly>
        </div>
    }

}

<style scoped>
    .login-container{
        background-color: rgb(222, 222, 222);
    }

</style>