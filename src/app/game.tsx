"use client"

import { useEffect, useState } from 'react';



export default function Game({ id }: { id: string }) {

  const [dataIgnored, setData] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`/game/${id}/gameUpdated`);
    eventSource.onmessage = ({ data }) => {
      setData(data);
    };
    return () => {
      eventSource.close();
    };
  });

  return <>
    {id}
  </>
}