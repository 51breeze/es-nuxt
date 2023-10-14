package api.http;

class Account extends Base{

    private lang:string = 'sss';

    @Get('/index')
    index(){
        cookie("name", 'zhansan')
        cookie("age", '30')
        return this.success({msg:'Account create. 66666666666'});
    }
}