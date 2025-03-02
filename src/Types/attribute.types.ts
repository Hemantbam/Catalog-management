import { ProductEntity } from 'src/Entities/product.entity';
export type Attribute = {
  id: string;
  product: ProductEntity;
  key: string;
  value: string;
};
 
export type AddAttributeInput = {
  productId: string;
  key: string;
  value: string;
};

export type UpdateAttributeInput = {
  id: string;
  productId: string;
  key: string;
  value: string;
};

export type DeleteAttributeInput = {
  product_id: string;
  attribute_id: string;
};

export type AttributeFilterByProductInput = {
  productId: string;
  key: string;
};

export type AttributeFilterByIdInput = {
  id: string;
  key: string;
};

export type ProductAndAttributeIdLinkCheck = {
  productId: string;
  attributeId: string;
};
