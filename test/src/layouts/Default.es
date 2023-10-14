package layouts
import web.components.Component
class Default extends Component{
    @Override
    protected render(){
        return <div>
            <header>
                <div>Default Layout</div>
            </header>
            <slot:default />
        </div>
    }
}