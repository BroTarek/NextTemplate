For Quering

turning the component that need the data into a server component using async, and calling the data directly it performed server fecthing

so instead of using server action to fetch data , use server action only to mutate data , and move the fetching function to a server component 

const serverComponent=async()=>{
    const data=await fetchingFunction()
    return<>{// jsx}</>
}

//////////////////////////////////////////////////////////////////////

for mutating

we mutate using server actions 