/** Compute SHA-1 hex digest for a File or Uint8Array or Blob */
export async function sha1Hex(data: ArrayBuffer | Uint8Array | Blob): Promise<string> {
  const buf = data instanceof Blob
    ? await data.arrayBuffer()
    : data instanceof Uint8Array
      ? data.buffer
      : data
  const hash = await crypto.subtle.digest('SHA-1', buf)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
