import scentsJson from '../../data/scents.v010.json';
import customersJson from '../../data/customers.v013.json';
import citrusGlyph from '../../assets/glyphs/citrus.svg?url';
import aquaticGlyph from '../../assets/glyphs/aquatic.svg?url';
import greenGlyph from '../../assets/glyphs/green.svg?url';
import fruityGlyph from '../../assets/glyphs/fruity.svg?url';
import floralGlyph from '../../assets/glyphs/floral.svg?url';
import amberGlyph from '../../assets/glyphs/amber.svg?url';
import woodyGlyph from '../../assets/glyphs/woody.svg?url';
import aromaticGlyph from '../../assets/glyphs/aromatic.svg?url';
import type { Customer, CustomerType, ScentDefinition, ScentType, SpecialRule } from '../types/game';

const glyphUrls: Record<ScentType, string> = {
  citrus: citrusGlyph,
  aquatic: aquaticGlyph,
  green: greenGlyph,
  fruity: fruityGlyph,
  floral: floralGlyph,
  amber: amberGlyph,
  woody: woodyGlyph,
  aromatic: aromaticGlyph,
};

export const SCENTS: ScentDefinition[] = scentsJson.map((scent) => ({ ...scent, id: scent.id as ScentType, glyph: glyphUrls[scent.id as ScentType] }));
export const SCENT_BY_ID = Object.fromEntries(SCENTS.map((scent) => [scent.id, scent])) as Record<ScentType, ScentDefinition>;
export const CUSTOMERS: Customer[] = customersJson.map((customer) => ({
  ...customer,
  type: customer.type as CustomerType,
  specialRule: customer.specialRule as SpecialRule | undefined,
  preferenceScents: customer.preferenceScents as ScentType[],
  negativeScents: 'negativeScents' in customer ? customer.negativeScents as ScentType[] : undefined,
}));
export const CUSTOMER_BY_ID = Object.fromEntries(CUSTOMERS.map((customer) => [customer.id, customer])) as Record<string, Customer>;
export const FULL_BAG: ScentType[] = SCENTS.flatMap((scent) => Array.from({ length: scent.bagCopies }, () => scent.id));
