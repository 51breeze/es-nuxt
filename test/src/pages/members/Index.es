package pages.members;

import web.components.Page;
import web.components.Viewport

@Router('members/index')
class Index extends Page{

    @Override
    protected render(){
        
        return <div>
            <div>members/Index</div>
            <Viewport />
        </div>
    }

}