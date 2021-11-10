export const makeArrayChunks = (inputArray, chunkSize) => {
    console.log({ inputArray })
    let res = [];

    let count=0;
    for (let i = 0; i < 10; i = i + 1) {
        let temp = [];
        for (let j = 0; j < 10; j++) {
            temp.push(inputArray[count])
            count=count+1;
        }
        res.push(temp);
    }
    return res;
    // return inputArray.reduce((resultArray, item, index) => {
    //     const chunkIndex = Math.floor(index / chunkSize)

    //     if (!resultArray[chunkIndex]) {
    //         resultArray[chunkIndex] = [] // start a new chunk
    //     }

    //     resultArray[chunkIndex].push(item)

    //     return resultArray
    // }, [])
}