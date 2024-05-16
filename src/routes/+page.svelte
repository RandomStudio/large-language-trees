<script lang="ts">
    function handleSubmit(event: SubmitEvent) {
        // Specify the type of the event
        event.preventDefault();
        window.location.href = "./garden";
    }
</script>

<main>
    <form on:submit={handleSubmit}>
        <label for="uname">User Name</label>
        <input type="text" id="uname" name="uname" /><br /><br />
        <label for="gname">password</label>
        <input type="password" id="gname" name="gname" /><br /><br />
        <button type="submit">Submit</button>
    </form>
</main>

<style>
    main {
        display: flex;
        justify-content: center; /* Centers content horizontally */
        align-items: center; /* Centers content vertically */
        height: 100vh; /* Takes full viewport height */
        margin: 0; /* Removes default margin */
        padding: 20px; /* Adds padding around the content */
        font-family: Arial, sans-serif; /* Sets the font type to Arial */
        font-size: 15px; /* Sets the font size to 15 */
    }

    form {
        display: flex;
        flex-direction: column; /* Stacks form elements vertically */
        align-items: center; /* Centers form elements horizontally */
        width: 100%; /* Optional: Adjusts form width if necessary */
        max-width: 300px; /* Optional: Restricts form width for better form field alignment */
    }

    input,
    label {
        width: 100%; /* Ensures labels and inputs expand to the width of the form */
        box-sizing: border-box; /* Includes padding and border in the element's total width and height */
        margin-bottom: 10px; /* Adds space between form elements */
    }

    button {
        width: 30%; /* Matches the width of the form elements */
        padding: 5px 0; /* Adds padding for better button size */
        cursor: pointer; /* Indicates the button is clickable */
        text-align: center; /* Ensures the text in the button is centered */
        background-color: white; /* Sets background color to white */
        border: 0.5px solid black; /* Defines border as 0.5 pixels thick, solid, and black */
        border-radius: 1px; /* Sets the border radius to 1 pixel */
        font-family: Arial, sans-serif; /* Explicitly sets the font type to Arial for the button */
        font-size: 15px;
        font-weight: normal; /* Sets font weight to normal, avoiding bold */
    }
</style>
