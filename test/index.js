const fs = require('fs')
const path = require('path')
const compiler = require("./compiler");

//const root = path.join(__dirname,'./specs');
//const specs = fs.readdirSync( root );
//specs.forEach(file=>require(path.join(root,file)));

const creator = new compiler.Creator();
describe('compile file pages/Person', function() {
   
    let compilation = null;
    let errors = [];
    beforeAll(async function() {
        compilation = await creator.factor('./pages/Person.es');
        errors = compilation.compiler.errors;
    });

    afterAll(()=>{
        errors.forEach( item=>{
            if( item.kind == 0 ){
                fail( item.toString() )
            }
        });
        compilation = null;
    })

    it('should compile success and build', function() {
        expect('Expected 0 errors').toContain( errors.length );
        if( errors.length===0 ){
            creator.build( compilation);
        }
    });
    
});

describe('compile file App', function() {
    let compilation = null;
    let errors = [];
    beforeAll(async function() {
        compilation = await creator.factor('./pages/Members.es');
        errors = compilation.compiler.errors;
    });

    afterAll(()=>{
        errors.forEach( item=>{
            if( item.kind == 0 ){
                fail( item.toString() )
            }
        });
        compilation = null;
    })

    it('should compile success and build', function() {
        expect('Expected 0 errors').toContain( errors.length );
        if( errors.length===0 ){
            creator.build( compilation);
        }
    });
    
});
