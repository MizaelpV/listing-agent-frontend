import client from "./client";

export const listingsApi = {
  generate: (data: FormData) => client.post("/listings/generate", data),
  publish: (draftId: string) => client.post(`/listings/publish/${draftId}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post("/listings/upload-image", form);
  },
};
