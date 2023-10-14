package pages;

import web.components.Page;
import web.components.Viewport

@Router('members')
@Redirect(pages.members.Profile)

class Members extends Page{

    @Override
    protected onMounted():void{
        
        console.log('--onMounted--')
    }

    @Override
    protected render(){
        
        return <div>
            <div>members/Index</div>
            <Viewport />
        </div>
    }

}