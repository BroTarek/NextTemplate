import React from 'react'
import Image from 'next/image'
import testImg from '../public/img.jpg'
const page = () => {
  
  return (
    <>
    <div>Local image - path string</div>
    <Image src='/img.jpg' width={800} height={600} alt='Local Image' className='h-auto w-full max-w-[600px] object-cover' />
    <div>Local image - path string</div>
    <Image src={testImg} alt='' placeholder='blur'/>{
      // no need to initialize the height and width becuse next.js recognizes the dimensions


      // <Image src={testImg} width={100} alt=''/> no layout shift happens here even though we did not specify the height
    }

    {
    
    /* <Image src={'https://via.assets.so/game.png?id=1&q=95&w=95&h360'} alt=''  width={100} height={100} fill/>{/**fills the whole space of the parent element
     */}



    </>
  )
}

export default page