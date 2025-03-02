import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AttributeEntity } from 'src/Entities/attribute.entity';
import {
  Attribute,
  AddAttributeInput,
  AttributeFilterByIdInput,
  AttributeFilterByProductInput,
  DeleteAttributeInput,
  UpdateAttributeInput,
  ProductAndAttributeIdLinkCheck,
} from 'src/types/attribute.types';

@Injectable()
export class AttributeRepository {
  constructor(
    @InjectRepository(AttributeEntity)
    private readonly attributeRepository: Repository<AttributeEntity>,
  ) {}

  async addNewAttributeInDb({
    productId,
    key,
    value,
  }: AddAttributeInput): Promise<boolean> {
    const newAttribute = this.attributeRepository.create({
      product: { id: productId },
      key,
      value,
    });

    const result = await this.attributeRepository.save(newAttribute);
    return !!result.id;
  }

  async fetchAttributeDataByIdInDb(id: string): Promise<Attribute[] | null> {
    const result = await this.attributeRepository.find({
      where: { id: id },
      relations: ['product'],
    });
    return result.length > 0 ? result : null;
  }

  async fetchAttributeDataWithKeyAndIdInDb({
    id,
    key,
  }: AttributeFilterByIdInput): Promise<Attribute[] | null> {
    const result = await this.attributeRepository.find({ where: { id, key } });
    return result.length > 0 ? result : null;
  }

  async fetchAttributeDataWithKeyAndProductIdInDb({
    productId,
    key,
  }: AttributeFilterByProductInput): Promise<Attribute[] | null> {
    const result = await this.attributeRepository.find({
      where: { key: key, product: { id: productId } },
      relations: ['product'],
    });
    return result.length > 0 ? result : null;
  }

  async updateAttributeDataInDb({
    id,
    productId,
    key,
    value,
  }: UpdateAttributeInput): Promise<boolean> {
    const result = await this.attributeRepository.update(
      { id, product: { id: productId } },
      { key, value },
    );
    return result.affected > 0;
  }

  async deleteAttributeDataFromDb({
    product_id,
    attribute_id,
  }: DeleteAttributeInput): Promise<boolean> {
    const result = await this.attributeRepository.delete({
      id: attribute_id,
      product: { id: product_id },
    });
    return result.affected > 0;
  }

  async fetchProductDetailsWithAttributeIdAndProductId({
    productId,
    attributeId,
  }: ProductAndAttributeIdLinkCheck): Promise<Attribute[] | null> {
    const result = await this.attributeRepository.find({
      where: {
        id: attributeId,
        product: { id: productId },
      },
    });
    return result.length > 0 ? result : null;
  }
}
