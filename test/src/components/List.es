package components{
    import web.components.Component;
    class List extends Component{
        @Override
        protected render():VNode|Component {
            return <div sss="ss"  class="list">
                <div>=========List=======</div>
                <div>
                    <slot:default />
                </div>
            </div>
        }
    }
}

<style scoped>
    .list{
        background-color: rgb(157, 204, 157);
    }

</style>