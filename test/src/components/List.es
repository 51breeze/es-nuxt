package components{
    import web.components.Component;
    class List extends Component{
        @Override
        protected render():VNode|Component{
            
            return <div>

                <div>=========List Component===</div>
                <div>
                    <slot:default />
                </div>
            
            </div>
        }
    }
}