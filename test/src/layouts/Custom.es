package layouts
import web.components.Component
class Custom extends Component{
    @Override
    protected render(){
        return <div xmlns:ui="web.ui">
            
                 <ui:Affix>
                    <header>
                        <div>Custom Layout 6666</div>
                    </header>
                 </ui:Affix>
            
            <slot:default />
        </div>
    }
}