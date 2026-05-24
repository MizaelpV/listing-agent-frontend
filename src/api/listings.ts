import client from "./client";

interface GenerateResponse {
  draft_id: string;
  title: string;
  description: string;
  category_id: string;
  category_name: string;
  required_attributes: MeliAttribute[];
}

export interface MeliAttribute {
  id: string;
  name: string;
  value_type: string;
  values?: MeliAttributeValue[];
  allowed_units?: MeliUnit[];
  default_unit?: string;
  prefilled_value?: string;
  tags: {
    required?: boolean;
    catalog_required?: boolean;
    allow_variations?: boolean;
    conditional_required?: boolean;
  };
}

interface MeliAttributeValue {
  id: string;
  name: string;
}

interface MeliUnit {
  id: string;
  name: string;
}

interface PublishOverrides {
  title?: string;
  description?: string;
  attributes?: FilledAttribute[];
  pictures?: string[]; // R2 public URLs
}

export interface FilledAttribute {
  id: string;
  value_name: string;
}

interface PublishResponse {
  meli_url: string;
  meli_item_id: string;
}

interface UploadImageResponse {
  url: string;
}

export const listingsApi = {
  generate: (data: FormData) =>
    client.post<GenerateResponse>("/listings/generate", data),

  publish: (
    draftId: string,
    overrides: PublishOverrides,
  ): Promise<PublishResponse> =>
    client
      .post<PublishResponse>(`/listings/publish/${draftId}`, overrides)
      .then((r) => r.data),

  uploadImage: (file: File): Promise<UploadImageResponse> => {
    const form = new FormData();
    form.append("file", file);
    return client
      .post<UploadImageResponse>("/listings/upload-image", form)
      .then((r) => r.data);
  },
};
