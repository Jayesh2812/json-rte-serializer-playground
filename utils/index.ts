// Setup get and post to paste bin api using fetch

export const pasteToBin = async (dataToStore: string) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("api_dev_key", process.env.PASTEBIN_API_KEY!);
  urlencoded.append("api_paste_code", dataToStore);
  urlencoded.append("api_option", "paste");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  try {
    const response = await fetch(
      "https://pastebin.com/api/api_post.php",
      requestOptions
    );
    if(!response.ok){
      throw new Error(await response.text());
    }
    const result = await response.text();
    return [result];
  } catch (error) {
    return [,error];
  }
};

export const getFromBin = async (id: string) => {
  const myHeaders = new Headers();

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `https://pastebin.com/raw/${id}`,
      requestOptions
    );

    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.text();
    return [result];
  } catch (error) {
    return [, error]
  }
};
