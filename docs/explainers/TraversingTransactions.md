# Transaction Tracing

Perhaps the important part of interacting with OCF will be traversing the event stack to determine
the current state of a company's capitalization table. Most of the time, this involves tracking the
state of a given issuance of securities to a stakeholder from the date of issuance until the
issuance is ultimately extinguished - meaning no shares remaining outstanding under the original
`security_id`.

## Refresher on OCF ID Types and Uses

Remember, there are multiple IDs associated with issuance transactions, and each has a different
purpose:

1. `id` - _every_ OCF object has an id. This is meant to be a unique identifier within OCF such that
   no two objects _of the same type_ within a given OCF export have the same `id` value. (though the
   specific form is up to a given implementer). While implementers can assign id values that have
   significance elsewhere in their systems - e.g. using ids that correspond to some significant
   value in other cap tables or some sort of global registry of securities - we only use OCF `id`
   values to identify objects for programmatic processing and extraction of OCF cap table data.
2. `security_id` - This is best thought of as analgous to a certificate id in the old-fashioned,
   paper security world. Every issuance has a `security_id`, and this ID should be used anytime
   another transaction is acting on the shares issued in the issuance event identified with this
   `security_id`. **Here are a couple illustrations of where and how `security_id` is used**:
    1. To exercise an option, the `PlanSecurityExercise` transaction refers to a `security_id`. This
       must be the the `security_id` of the `PlanSecurityIssuance` event used to issue the option
       being exercised.
    2. To transfer shares of stock, the `StockTransfer` transaction's `security_id` field should
       contain the id of the `security_id` value provided in the `StockIssuance` event used to issue
       the original shares being transferred.
3. `custom_id` - is a freetext field provided to store a certificate ID (or some sort of other,
   implementer-specific id for a given issuance of securities).
4. `share_numbers_issued` - is meant to track specific share numbers that are part of an issuance in
   situations where shares are **not** fungible. For example, in a jurisdiction where issuing shares
   300 - 500 is legall significant and different from issuing shares 700 - 900, you'd need to use
   this field to track the share numbers that are part of a given issuance.

## Terminal Transactions

A **terminal** transaction is an OCF event which acts on a `security_id` created in one of our
[Issuance](../schema_markdown//schema/primitives/objects/transactions/issuance/Issuance.md) events
and, in the process, issues a new `security_id` for the securities that were issued. Alternatively a
transaction which extinguishes issued securities entirely, in which case no `security_id` applies to
them, is also terminal.

The following transaction are terminal:

1. **Cancellation** - transactions composed of
   [Cancellation](../schema_markdown/schema/primitives/objects/transactions/cancellation/Cancellation.md) -
   which includes `StockCancellation`, `WarrantCancellation`, `PlanSecurityCancellation` and
   `ConvertibleCancellation` - all extingush a given `security_id` and must refer to the pre-exsting
   `security_id` of the securities being cancelled. These transactions assume you can cancel an
   existing issuance in whole _or in-part_. Their `balance_security_id` field is meant to be used
   where an issuance is cancelled in-part and some of the original securities issued under the
   original `security_id` remain outstanding, issued to the same stakeholder as the original
   `security_id`.
2. **Conversion** - transactions composed of
   [Conversion](../schema_markdown/schema/primitives/objects/transactions/conversion/Conversion.md) -
   which includes `ConvertibleConversion` and `StockConversion` - are terminal. These events must
   link to the `security_id` of the original issuance being converted. If the `balance_security_id`
   field is present, it means the original security was only converted in-part and the remaining
   securities have the new `security_id` provided in the `balance_security_id` field. Any resulting
   securities from the conversion - e.g. Stock issued as part of a Convertible conversion or a
   conversion from preferred to common - should have their issuance ids in the
   `resulting_security_ids` field.
3. **Exercise** - transactions composed of
   [Exercise](../schema_markdown/schema/primitives/objects/transactions/exercise/Exercise.md) -
   which includes `PlanSecurityExercise` and `WarrantExercise` - are terminal. These events must
   link to the `security_id` of the original issuance being converted. If the `balance_security_id`
   field is present, it means the original security was only converted in-part and the remaining
   securities have the new `security_id` provided in the `balance_security_id` field. Any resulting
   securities from the conversion - e.g. Stock issued from a warrant or option exercise - should
   have their issuance ids in the `resulting_security_ids` field.
4. **Repurchase** -
   [StockRepurchase](../schema_markdown/schema/objects/transactions/repurchase/StockRepurchase.md)
   transactions must link to the `security_id` of the original stock issuance that is being
   repurchased. Their `balance_security_id` field is meant to be used where an issuance is only
   repurchased in-part and some of the original securities issued under the original `security_id`
   remain outstanding, issued to the same stakeholder as the original `security_id`.
5. **Reissuance** - transactions should be used in situations analagous to where a certificate might
   be re-issued (such as with new legends). The
   [Stock Re-Issuance](../schema_markdown/schema/objects/transactions/reissuance/StockReissuance.md)
   transaction must link to the `security_id` of the original stock issuance that is being
   re-issued. There is no `balance_security_id` field as, in such cases, we require an issuance to
   be re-issued in full. There can be multiple issuances resulting from a single re-issuance,
   however, so each re-issuance can point to multiple `resulting_security_ids`.
6. **Transfer** - transactions composed of
   [Transfer](../schema_markdown/schema/primitives/objects/transactions/transfer/Transfer.md) -
   which includes `StockTransfer`, `WarrantTransfer`, `PlanSecurityTransfer` and
   `ConvertibleTransfer` - transactions must link to the `security_id` of the original issuance the
   transferred securities were issued as a part of. This transfer can be in whole or in part, and it
   can be to a single new issuance or to multiple new issuances. If the transfer is in-part, any
   remaining securities must be issued with a new `security_id` which should be referred to as the
   `balance_security_id`. The `security_id`s of the resulting issuances to the transferees should be
   recorded in an array in the `resulting_security_ids` field.
7. **Release** - transactions composed of
   [Release](../schema_markdown/schema/primitives/objects/transactions/release/Release.md) - which
   includes `PlanSecurityRelease` - must like to the `security_id` of the original plan security
   issuance that is being released. There is never a `balance_security_id` field.
8. **Retraction** - transactions composed of
   [Retraction](../schema_markdown/schema/primitives/objects/transactions/retraction/Retraction.md) -
   which includes `StockRetraction`, `WarrantRetraction`, `PlanSecurityRetraction` and
   `ConvertibleRetraction` - must link to the `security_id` of the original security issuance that
   is being retracted. Unlike many of the preceding transaction types, there is never a
   `balance_security_id` on this transaction type.

## Transactions In-Part are Still Terminal

In many cases, our OCF transaction events allow _part_ of an issuance to be acted upon - e.g. a
transfer or repurchase in part - but some of the original issuance will remain outstanding to the
same holder. This is still a terminal transaction in OCF nomenclature as these events require new
`security_ids` to be issued. For example, let's say 1,000 shares are issued to Bob and then Bob
transfers 500 to Frank. In order to model this in OCF, there are two issuance events - one to Frank
for 500 shares and one to Bob for his remaining 500 shares. These will be linked to a Transfer event
by id references. Bob's issuance event `security_id` for the issuance of his 500 share remainder
will go in the `balance_security_id` field of the transfer, and Frank's issuance's `security_id`
will go in the `resulting_security_ids` field of the transfer event. After recording the transfer
event, the original `security_id` from the original issuance is no longer in use.
