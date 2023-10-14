package layouts
import web.components.Component
class Custom extends Component{
    @Override
    protected render(){
        return <div>
            <header>
                <div>Custom Layout</div>
            </header>
            <slot:default />
        </div>
    }
}