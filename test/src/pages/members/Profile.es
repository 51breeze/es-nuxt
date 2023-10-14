package pages.members;

import web.components.Page;

@Router(profile, id?=5, name?='cid' )
class Profile extends Page{

    @Override
    protected onMounted():void{

    //     console.log('-----Profile--onMounted---------')

    //      let parent = this.parent;

    //    while(parent){
           
    //          const el = parent['subTree'].el;
    //          console.log(parent['uid'], parent['type']['name'] || parent['type'],  parent['subTree'].el );
    //         //if( parent instanceof Component){
    //            parent = parent.parent
    //            if(parent && !parent['subTree'].el && el){
    //             parent['subTree'].el = el;
    //            }
    //         //}else{
    //           // break;
    //         //
    //    }

    }

    @Override
    protected render(){
        
        return <div>Profile</div>
    }

}