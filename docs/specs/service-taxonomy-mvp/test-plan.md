# Service taxonomy MVP — Test plan

| ID | Level | Criterion |
| --- | --- | --- |
| TP-01 | int service | create unique service |
| TP-02 | int service | duplicate slug → 409 |
| TP-03 | int service | synonym used by category → 409 |
| TP-04 | int service | missing id → 404 |
| TP-05 | int service | publish catalog.service.created |
| TP-06 | int controller | POST /services → 201 |
