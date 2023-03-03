/*Q1. JS Variable needs to be created here. Below variable is just an example. Try to add more attributes.*/
const initialTravellers = [
  {
    id: 1, name: 'Jack', phone: 88885555,
    bookingTime: new Date(),
    gender:'male',
  },
  {
    id: 2, name: 'Rose', phone: 88884444,
    bookingTime: new Date(),
    gender:'female',
  },
];
const seat_num=10;
const partition=2;


function TravellerRow(props) {
  {/*Q3. Placeholder to initialize local variable based on traveller prop.*/}
  const id=props.id;
  const name=props.name;
  const phone=props.phone;
  const bookingtime=props.bookingTime.toUTCString();
  const gender=props.gender;
  
  return (
    <tr key={String(id)+'dummy'}>
	  {/*Q3. Placeholder for rendering one row of a table with required traveller attribute values.*/}
      <td key={id}>{id}</td>
      <td key={name}>{name}</td>
      <td key={phone} >{phone}</td>
      <td key={bookingtime}>{bookingtime}</td>
      <td key={gender}>{gender}</td>
    </tr>
  );
}

function Display(props) {
  
	/*Q3. Write code to render rows of table, reach corresponding to one traveller. Make use of the TravellerRow function that draws one row.*/
  const travellers_data=props.travellers.map(item=>TravellerRow(item));
  const display=props.selector;
  return (
    <table className="bordered-table" style={{display:display==2?'block':'none'}}>
      <thead>
        <tr>
	  {/*Q3. Below table is just an example. Add more columns based on the traveller attributes you choose.*/}
          <th>ID</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Booking Time</th>
          <th>gender</th>
        </tr>
      </thead>
      <tbody>
        {/*Q3. write code to call the JS variable defined at the top of this function to render table rows.*/}
        {travellers_data}
      </tbody>
    </table>
  );
}

class Add extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state={message:''};
  }
  checkinput(f){
    const name_c=/^(?!_)([A-Za-z ]+)$/.test(f.travellername.value);
    if(!name_c){
      this.setState({message:'please input valid name, characters and blank'});
      return false;
    }
    const phone_c=/^\d{8}$/.test(f.travellerphone.value);
    if(!phone_c){
      this.setState({message:'please input valid phone number, 8 digits'});
      console.log(typeof(f.travellerphone.value),phone_c);
      return false;
    }
    return true;
  }
  handleSubmit(e) {
    e.preventDefault();
    /*Q4. Fetch the passenger details from the add form and call bookTraveller()*/
    const form = document.forms.addTraveller;
    if(this.checkinput(form)){
      if(this.props.bookTraveller(form))
        this.setState({message:'successfully booked! name: '+form.travellername.value+' phone number: '+form.travellerphone.value})
      else
        this.setState({message:'duplicated or exceed maxium seats '})
    }
  }

  render() {
    return (
      <form name="addTraveller" onSubmit={this.handleSubmit} style={{display:this.props.selector==3?'block':'none'}}>
	    {/*Q4. Placeholder to enter passenger details. Below code is just an example.*/}
        <input type="text" name="travellername" placeholder="Name" />
        <input type="number" name="travellerphone" placeholder="phone" />
        <input type="text" list="typelist" name="travellergender" placeholder="gender"/>
        <datalist id="typelist">
            <option>male</option>
            <option>female</option>
        </datalist>
        <button>Add</button>
        <br/>
        <label>{this.state.message}</label>
      </form>
    );
  }
}


class Delete extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state={message:''}
  }
  handleSubmit(e) {
    e.preventDefault();
    /*Q5. Fetch the passenger details from the deletion form and call deleteTraveller()*/
    const form=document.forms.deleteTraveller;
    if(!(/^\d+/.test(form.travellerid.value))){
      this.setState({message:'please input valid number, positive, not null'});
    }
    else if(this.props.deleteTraveller(form)){
      this.setState({message:'delete passenger id:'+form.travellerid.value+' successfully'});
    }else{
      this.setState({message:'passenger id:'+form.travellerid.value+' not found'});
    }
  }

  render() {
    return (
      <form name="deleteTraveller" onSubmit={this.handleSubmit} style={{display:this.props.selector==4?'block':'none'}}>
	    {/*Q5. Placeholder form to enter information on which passenger's ticket needs to be deleted. Below code is just an example.*/}
	  <input type="number" name="travellerid" placeholder="id" />
        <button>Delete</button>
        <br/>
        <label>{this.state.message}</label>
      </form>
    );
  }
}

class Homepage extends React.Component {
  constructor() {
    super();
  }
	render(){
  var occupied=this.props.state.travellers.length; 
  if(typeof(occupied)!=typeof(1)){
    console.log(occupied);
    occupied=0;
  }
  var green=[]
  for(var i =0;i<occupied;i++){
    green.push(false);
  }
  for(var i=0;i<seat_num-occupied;i++){
    const seed=Math.floor(Math.random()*(green.length-1));
    green.splice(seed,0,true);
  }
  green=green.map((item,idx)=><td key={String(item)+String(idx)} style={{backgroundColor:item?'green':'gray'}}>___</td>)
  var visual_seat=[];
  for(var i=0;i<partition;i++)
    visual_seat.push([]);
  for(var i =0;i<green.length;i++){
    visual_seat[i%partition].push(green[i]);
  }
  visual_seat=visual_seat.map((item,idx)=><tr key={String(idx)+String(item)}>{item}</tr>)


	return (
	<div style={{display:this.props.state.selector==1?'block':'none'}}>
		{/*Q2. Placeholder for Homepage code that shows free seats visually.*/}
    <label>Free Seats numbers </label>
    <label>{seat_num-occupied}</label>
    <br/>
    <table>
      <tbody>
        {visual_seat}
      </tbody>
    </table>
	</div>);
	}
}

class TicketToRide extends React.Component {
  constructor() {
    super();
    this.state = { travellers: [], selector: 1};
    this.bookTraveller = this.bookTraveller.bind(this);
    this.deleteTraveller = this.deleteTraveller.bind(this);
  }

  setSelector(value)
  {
  	/*Q2. Function to set the value of component selector variable based on user's button click.*/
    this.setState({selector:value})
  }
  componentDidMount() {
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      this.setState({ travellers: initialTravellers });
    }, 500);
  }

  bookTraveller(e) {
	    /*Q4. Write code to add a passenger to the traveller state variable.*/
      const name_tp=e.travellername.value;
      const phone_tp=e.travellerphone.value;
      const gender_tp=e.travellergender.value;
      if(this.state.travellers.length>=seat_num)
        return false;
      var id_ava=[];
      for(var i=0;i<seat_num;i++)
        id_ava.push(true);
      for(var i in this.state.travellers){
        i=this.state.travellers[i];
        if(i.name==name_tp&&i.phone==phone_tp){
          return false;
        }
        id_ava[i.id-1]=false;
      }
      const id=(function(){
        for(var i=0;i<id_ava.length;i++){
          if(id_ava[i])
            return i+1;
        }
      })();
      this.state.travellers.push({
        id:id,
        name:name_tp,
        phone:phone_tp,
        bookingTime:new Date(),
        gender:gender_tp
      })
      return true; 
  }

  deleteTraveller(passenger) {
	  /*Q5. Write code to delete a passenger from the traveller state variable.*/
    const id_tp=passenger.travellerid.value;
    for(var i in this.state.travellers){
      const instance=this.state.travellers[i];
      if(instance.id==id_tp){
        this.state.travellers.splice(i,1);
        return true;
      }
    }
    return false;
  }
  render() {
    return (
      <div>
        <h1>Ticket To Ride</h1>
	<div>
	    {/*Q2. Code for Navigation bar. Use basic buttons to create a nav bar. Use states to manage selection.*/}
      <nav>
        <button onClick={()=>this.setSelector(1)}>free seats</button>
        <button onClick={()=>this.setSelector(2)}>display traveller</button>
        <button onClick={()=>this.setSelector(3)}>booking</button>
        <button onClick={()=>this.setSelector(4)}>delete</button>
      </nav>
	</div>
	<div>
		{/*Only one of the below four divisions is rendered based on the button clicked by the user.*/}
		{/*Q2 and Q6. Code to call Instance that draws Homepage. Homepage shows Visual Representation of free seats.*/}
    <Homepage state={this.state}/>
		{/*Q3. Code to call component that Displays Travellers.*/}
		{Display(this.state)}
		{/*Q4. Code to call the component that adds a traveller.*/}
    <Add bookTraveller={this.bookTraveller} selector={this.state.selector}/>
		{/*Q5. Code to call the component that deletes a traveller based on a given attribute.*/}
    <Delete deleteTraveller={this.deleteTraveller} selector={this.state.selector}/>
	</div>
      </div>
    );
  }
}

const element = <TicketToRide />;

ReactDOM.render(element, document.getElementById('contents'));
