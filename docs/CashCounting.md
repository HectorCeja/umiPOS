# Cash Counting

Counts can be total or denomination-based. When denominations are supplied, the backend recomputes `Σ denominationMinor × quantity` and ignores any client total. Counts are sequenced and immutable. Blind count hides expected cash until submission when policy requires it; recount appends evidence rather than replacing a count.
