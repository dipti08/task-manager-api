//Writing Synchronous test cases
const {calculateTip,fahrenheitToCelsius,celsiusToFahrenheit,add}=require('../src/math')

test('Should calculate total with tip',()=>{
    const total=calculateTip(10,.3)
    expect(total).toBe(13)   //'expect()' is provided by jest. Since here we are expecting the value of 'total', so we pass total inside of expect. Also, we expect it to be 13.
})

test('should calculate total with default tip',()=>{
    const total=calculateTip(10)
    expect(total).toBe(12.5)
})

test('should convert 32 F to 0 C',()=>{
    const temperature=fahrenheitToCelsius(32)
    expect(temperature).toBe(0)
})

test('should convert 0 C to 32 F',()=>{
    const temperature=celsiusToFahrenheit(0)
    expect(temperature).toBe(32)
})

// //Without using 'done', even the async function runs because the JEST doesn't know that this is an async function.
// //To tell JEST that this a async function, we add 'done' as the parameter. 'Done' is called at the end of our assertion.
// test('Async test demo',(done)=>{
//     setTimeout(()=>{
//         expect(1).toBe(2)
//         done()  //When we provide 'done' as the parameter, JEST sees that and it will consider this test case as failure until done is called. This will make sure jest actually waits for setTimeOut to finish and for our assertion to be created or made before figuring out that the test succeeded or failed.
//     },2000)
    
// })

test('Should add two numbers',(done)=>{
    add(2,3).then((sum)=>{
        expect(sum).toBe(5);
        done();
    })
})

//async-await functions will always return a promise. This is the most common method used to write tests in asynchronous.
test('Should add two numbers as async/await', async()=>{
    const sum=await add(10,22)
    expect(sum).toBe(32)
})
