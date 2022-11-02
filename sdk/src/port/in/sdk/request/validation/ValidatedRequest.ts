/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import BaseError from '../../../../../core/error/BaseError.js';
import { BaseRequest } from '../BaseRequest.js';
import { ValidationSchema, ValidatedRequestKey } from './ValidationSchema.js';
import ValidationResponse from './ValidationResponse.js';
import { getOptionalFields } from '../../../../../core/decorators/OptionalDecorator.js';
import { RuntimeError } from '../../../../../core/error/RuntimeError.js';
import { EmptyValue } from '../error/EmptyValue.js';
export default class ValidatedRequest<T extends BaseRequest> {
	private schema: ValidationSchema<T>;

	constructor(schema: ValidationSchema<T>) {
		this.schema = schema;
	}

	public validate(key?: ValidatedRequestKey<T>): ValidationResponse[] {
		const vals: ValidationResponse[] = [];
		if (!key) {
			const filteredEntries = this.filterSchemaFromProps();
			filteredEntries.forEach((key) => {
				this.pushValidations(key, vals);
			});
		} else {
			this.pushValidations(key, vals);
		}
		return vals;
	}

	protected getOptionalFields(): ValidatedRequestKey<T>[] {
		let keys: ValidatedRequestKey<T>[] = [];
		keys = Object.keys(
			getOptionalFields(this) ?? {},
		) as ValidatedRequestKey<T>[];
		return keys;
	}

	protected isOptional(key: ValidatedRequestKey<T>): boolean {
		return this.getOptionalFields().includes(key);
	}

	private getProperty(propertyName: keyof this): any {
		return this[propertyName];
	}

	private runValidation(
		propertyName: ValidatedRequestKey<T>,
		val: any,
	): ValidationResponse | undefined {
		if (
			this?.schema[propertyName] &&
			!this.isOptional(propertyName) &&
			val !== undefined
		) {
			try {
				const err = this.schema[propertyName]?.(val);
				if (err?.length && err.length > 0) {
					return new ValidationResponse(propertyName.toString(), err);
				}
			} catch (err) {
				return new ValidationResponse(propertyName.toString(), [
					err as BaseError,
				]);
			}
		} else if (
			this?.schema[propertyName] &&
			!this.isOptional(propertyName) &&
			val === undefined
		) {
			return new ValidationResponse(propertyName.toString(), [
				new EmptyValue(propertyName),
			]);
		} else if (
			!this?.schema[propertyName] &&
			!this.isOptional(propertyName)
		) {
			throw new RuntimeError(
				`Invalid validation schema for property '${propertyName.toString()}'. Did you forget to add the validation?`,
			);
		}
	}

	private filterSchemaFromProps(): ValidatedRequestKey<T>[] {
		const schemaEntries = Object.keys(
			this.schema,
		) as ValidatedRequestKey<T>[];
		const entries = Object.keys(this) as ValidatedRequestKey<T>[];
		const filteredEntries = schemaEntries.filter((value) =>
			entries.includes(value),
		);
		return filteredEntries;
	}

	private pushValidations(
		key: ValidatedRequestKey<T>,
		vals: ValidationResponse[],
	): void {
		const err = this.runValidation(
			key,
			this.getProperty(key as keyof this),
		);
		err && vals.push(err);
	}
}
