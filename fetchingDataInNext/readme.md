fetching data using server components is not ideal because it fetches data sequentially so no parallel fecthing is utilized
and it uses POST request under the hood ,and bypassed the auth layer

the problem with POST requests is it cant be cached and no parallelism 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

ideally we can fetch data on server components 

server components: by default layout and pages are server components, which alllows data fetching and render parts of the UI on the server , optionally cache the result ,and stream it to the client. When you need interactivity  or browser  APIs you can use client components to layer in functionality 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


the page.tsx was a client componet and the data fetching was in actions.ts which is a server action in a server component

what did he do?

moved the ui that made the page .tsx a client component into a seperate client component, making page.tsx a server componet, and moved the data fecthing from actions.ts to the page.tsx and mapped the returned data and passed it to the client component 


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

page component renders both the client and server components

every thing that enforces "use client" is in a client component
otherwise use server components
Do not call server action  from CLient components for fetching call them only for mutations, server actions should implicitly get called from server components for fetching and hsould not live inside a "use server" file

for more details:https://share.gemini.google/fYcyUEpiZOTo