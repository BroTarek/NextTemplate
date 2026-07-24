export default async function Page() {
  try {
    const res = await fetch('https://api.example.com/data')
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    const data = await res.json()
    
    return <div>{/* render data */}</div>
    
  } catch (error) {
    console.error('Fetch error:', error)
    return 
    <>
    {//Error loading data}
        </>
  }
}