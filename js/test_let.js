
for (let i=1; i <= 5; i++) {
  {
    console.log(i);
  }

  // setTimeout(function(){
  //   console.log("i: ", i);
  // }, i*1000);
}


console.log('next functions');
function one() {
  let test2 = 3;
  function two() {
    console.log(test2)
  }
  console.log(two());
}

one();

let test = 1;
{
  let test = 2;
}
console.log('test: ', test);
