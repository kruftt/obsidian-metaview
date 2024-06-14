Ordiri:
- Sidebar view
	- partitioned by fileClass
	- display and edit fields
	- incoming links labeled by class/field
- Manages fileClasses
	- add/remove fileClass (according to MDM setting)

- Displays views within notes according to type
	 sidebar + note views?
	e.g. for recipe "ingredients" view..
	top or bottom of note? (top) (use dv.view)
	can this be setup to plugin views..?
	- what data context?	 


---

Component
- parts : Component List

Event
- involves : Event List
- includes : Component List
- effects : Event List

Concept
- prerequisites : Concept List
- examples : (Component | Event) List


Objects:

Location
	Place, City, Country, Continent + Oceans, Earth, Solar System

Human Organism (component)
	Organs, Body Systems, Person, Family / Institution, Society, Humanity, Biosphere

Person (optional: extends Component)
- Birthday : Date
- Birthplace : Location
- Death date : Date
- Family : Kinship Institution
- Relations : Person Array

Institution
- Founded
  



---
Contact
- phone number
- email
- other?

--- 

Store items (Domestic, Ingredients (Flours, Spices, Vegetables, etc..))
- sources: Store Array


Recipe
- Ingredients:
	- step
		- { Ingredient: (number, measure) } Array


---

Book
- Author
- Chapter Array

Chapter