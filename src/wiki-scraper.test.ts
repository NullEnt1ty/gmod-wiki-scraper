import { describe, it, expect, vi, beforeAll } from "vitest";
import { WikiScraper } from "./wiki-scraper";
import { WikiApiClient } from "./wiki-api-client";
import { WikiPage } from "./types";

describe("WikiScraper", () => {
	let wikiApiClient: WikiApiClient;
	let wikiScraper: WikiScraper;

	beforeAll(() => {
		wikiApiClient = new WikiApiClient();
		wikiScraper = new WikiScraper(wikiApiClient);
	});

	it("parses a function page", () => {
		const mathPiPageContent =
			'<function name="pi" parent="math" type="libraryfield">\r\n' +
			"\t<description>\r\n" +
			"A variable containing the mathematical constant pi. (`3.1415926535898`)\r\n" +
			"\r\n" +
			"See also: <page>Trigonometry</page>\r\n" +
			"\r\n" +
			"<note>It should be noted that due to the nature of floating point numbers, results of calculations with `math.pi` may not be what you expect. See second example below.</note>\r\n" +
			"</description>\r\n" +
			"\t<realm>Shared and Menu</realm>\r\n" +
			"\t<rets>\r\n" +
			'\t\t<ret name="" type="number">The mathematical constant, Pi.</ret>\r\n' +
			"\t</rets>\r\n" +
			"</function>\r\n" +
			"\r\n" +
			"<example>\r\n" +
			"<code>\r\n" +
			"print( math.cos( math.pi ) )\r\n" +
			"</code>\r\n" +
			"<output>\r\n" +
			"```\r\n" +
			"-1\r\n" +
			"```\r\n" +
			"</output>\r\n" +
			"</example>\r\n" +
			"\r\n" +
			"<example>\r\n" +
			"<description>\r\n" +
			"\r\n" +
			"`sin(π) = 0`, but because floating point precision is not unlimited it cannot be calculated as exactly `0`.\r\n" +
			"</description>\r\n" +
			"<code>\r\n" +
			"print( math.sin( math.pi ), math.sin( math.pi ) == 0 )\r\n" +
			"</code>\r\n" +
			"<output>\r\n" +
			"```\r\n" +
			"1.2246467991474e-16 false\r\n" +
			"```\r\n" +
			"</output>\r\n" +
			"</example>\r\n";

		const mathPiFunction = wikiScraper.parseFunctionPage(mathPiPageContent);

		expect(mathPiFunction.name).toBe("pi");
		expect(mathPiFunction.parent).toBe("math");
		expect(mathPiFunction.realms).toEqual(
			expect.arrayContaining(["client", "server", "menu"]),
		);
		expect(mathPiFunction.returnValues).toEqual([
			{ type: "number", description: "The mathematical constant, Pi." },
		]);
	});

	it("parses a panel page", () => {
		const dbuttonPageContent =
			"<panel>\r\n" +
			"\t<parent>DLabel</parent>\r\n" +
			"\t<preview>DButton_small.png</preview>\r\n" +
			"\t<realm>Client and Menu</realm>\r\n" +
			"\t<file>lua/vgui/dbutton.lua</file>\r\n" +
			"\t<description>\r\n" +
			"A standard Derma button.\r\n" +
			"\r\n" +
			"By default, a <page>DButton</page> is 22px tall.\r\n" +
			"\t</description>\r\n" +
			"\t<overrides>\r\n" +
			"<page>PANEL:Init</page>\r\n" +
			"<page>PANEL:Paint</page>\r\n" +
			"<page>PANEL:PerformLayout</page>\r\n" +
			"<page>PANEL:GenerateExample</page>\r\n" +
			"\t</overrides>\r\n" +
			"</panel>\r\n" +
			"\r\n" +
			"<example>\r\n" +
			"\t<description>The DButton is exactly what you think it is - a button!</description>\r\n" +
			"\t<code>\r\n" +
			'local frame = vgui.Create( "DFrame" )\r\n' +
			"frame:SetSize( 300, 250 )\r\n" +
			"frame:Center()\r\n" +
			"frame:MakePopup()\r\n" +
			"\r\n" +
			'local DermaButton = vgui.Create( "DButton", frame ) // Create the button and parent it to the frame\r\n' +
			'DermaButton:SetText( "Say hi" )\t\t\t\t\t// Set the text on the button\r\n' +
			"DermaButton:SetPos( 25, 50 )\t\t\t\t\t// Set the position on the frame\r\n" +
			"DermaButton:SetSize( 250, 30 )\t\t\t\t\t// Set the size\r\n" +
			"DermaButton.DoClick = function()\t\t\t\t// A custom function run when clicked ( note the . instead of : )\r\n" +
			'\tRunConsoleCommand( "say", "Hi" )\t\t\t// Run the console command "say hi" when you click it ( command, args )\r\n' +
			"end\r\n" +
			"\r\n" +
			"DermaButton.DoRightClick = function()\r\n" +
			'\tRunConsoleCommand( "say", "Hello World" )\r\n' +
			"end\r\n" +
			"\t</code>\r\n" +
			"</example>\r\n" +
			"\r\n" +
			'<upload src="aaf9e/8dc31b7e5d67702.gif" size="1225486" name="DButton.gif" />';

		const dbuttonPanel = wikiScraper.parsePanelPage(dbuttonPageContent);

		expect(dbuttonPanel.parent).toBe("DLabel");
		expect(dbuttonPanel.description).toContain("A standard Derma button.");
	});

	it("parses a type page", () => {
		const entityPageContent =
			'<type name="Entity" category="classfunc" is="class">\r\n' +
			'\t<summary>This is a list of all available methods for all entities, which includes <page text="Players">Player</page>, <page text="Weapons">Weapon</page>, <page text="NPCs">NPC</page> and <page text="Vehicles">Vehicle</page>.\r\n' +
			"\r\n" +
			'For a list of possible members of <page>Scripted Entities</page> see <page text="ENT Structure">Structures/ENT</page>\r\n' +
			"</summary>\r\n" +
			"</type>";

		const entityType = wikiScraper.parseTypePage(entityPageContent);

		expect(entityType.name).toBe("Entity");
		expect(entityType.description).toContain(
			"This is a list of all available methods for all entities",
		);
	});

	it("parses an enum page", () => {
		const useEnumPageContent =
			"<enum>\r\n" +
			"\t<realm>Shared</realm>\r\n" +
			"\t<description>\r\n" +
			"Enumerations used by <page>Entity:SetUseType</page>. Affects when <page>ENTITY:Use</page> is triggered.\r\n" +
			"\r\n" +
			"Not to be confused with <page>Enums/USE</page> used for <page>ENTITY:Use</page> and others.\r\n" +
			"\t</description>\r\n" +
			"\t<items>\r\n" +
			'<item key="CONTINUOUS_USE" value="0">Fire a <page text="USE_ON">Enums/USE</page> signal every tick as long as the player holds their use key and aims at the target.</item>\r\n' +
			'<item key="ONOFF_USE" value="1">Fires a <page text="USE_ON">Enums/USE</page> signal when starting to use an entity, and a <page text="USE_OFF">Enums/USE</page> signal when letting go.\r\n' +
			"\r\n" +
			"<warning>There is no guarantee to receive both ON and OFF signals. A signal will only be sent when pushing or letting go of the use key while actually aiming at the entity, so an ON signal might not be followed by an OFF signal if the player is aiming somewhere else when releasing the key, and similarly, an OFF signal may not be preceded by an ON signal if the player started aiming at the entity only after pressing the key.\r\n" +
			"\r\n" +
			"Therefore, this method of input is unreliable and should not be used.</warning></item>\r\n" +
			'<item key="DIRECTIONAL_USE" value="2">Like a wheel turning.</item>\r\n' +
			'<item key="SIMPLE_USE" value="3">Fire a <page text="USE_ON">Enums/USE</page> signal only once when player presses their use key while aiming at the target.</item>\r\n' +
			"\t</items>\r\n" +
			"\r\n" +
			"</enum>\r\n" +
			"\r\n";

		const useEnum = wikiScraper.parseEnumPage(useEnumPageContent);

		expect(useEnum.name).toBeUndefined();
		expect(useEnum.fields).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: "CONTINUOUS_USE",
					value: 0,
					description: expect.stringContaining(
						'Fire a <page text="USE_ON">Enums/USE</page> signal every tick',
					),
				}),
				expect.objectContaining({
					name: "ONOFF_USE",
					value: 1,
					description: expect.stringContaining(
						'Fires a <page text="USE_ON">Enums/USE</page> signal when starting to use an entity',
					),
				}),
				expect.objectContaining({
					name: "DIRECTIONAL_USE",
					value: 2,
					description: "Like a wheel turning.",
				}),
				expect.objectContaining({
					name: "SIMPLE_USE",
					value: 3,
					description: expect.stringContaining(
						'Fire a <page text="USE_ON">Enums/USE</page> signal only once',
					),
				}),
			]),
		);
		expect(useEnum.realms).toEqual(
			expect.arrayContaining(["client", "server"]),
		);
		expect(useEnum.description).toContain(
			"Enumerations used by <page>Entity:SetUseType</page>",
		);
	});

	it("parses a struct page", () => {
		const angPosStructPageContent =
			"<structure>\r\n" +
			"\t<realm>Shared</realm>\r\n" +
			"\t<description>Table used by various functions, such as <page>Entity:GetAttachment</page>.</description>\r\n" +
			"\t<fields>\r\n" +
			'<item name="Ang" type="Angle">Angle object</item>\r\n' +
			'<item name="Pos" type="Vector">Vector object</item>\r\n' +
			'<item name="Bone" type="number" added="2023.11.02">The bone ID the attachment point is parented to.</item>\r\n' +
			"\t</fields>\r\n" +
			"\r\n" +
			"</structure>\r\n" +
			"\r\n";

		const angPosStruct = wikiScraper.parseStructPage(angPosStructPageContent);

		expect(angPosStruct.name).toBeUndefined();
		expect(angPosStruct.fields).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: "Ang",
					type: "Angle",
					description: "Angle object",
				}),
				expect.objectContaining({
					name: "Pos",
					type: "Vector",
					description: "Vector object",
				}),
				expect.objectContaining({
					name: "Bone",
					type: "number",
					description: "The bone ID the attachment point is parented to.",
				}),
			]),
		);
		expect(angPosStruct.realms).toEqual(
			expect.arrayContaining(["client", "server"]),
		);
	});

	it("gets pages in a category", async () => {
		const wikiApiClientMock = {
			renderText: vi.fn().mockResolvedValue({
				status: "ok",
				html:
					"<ul>\n" +
					'<li><a class="link-page exists" href="/gmod/Enums/_USE">_USE</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/ACT">ACT</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/AIMR">AIMR</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/AMMO">AMMO</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/ANALOG">ANALOG</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/BLEND">BLEND</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/BLENDFUNC">BLENDFUNC</a></li>\n' +
					'<li><a class="link-page exists" href="/gmod/Enums/BLOOD_COLOR">BLOOD_COLOR</a></li>\n' +
					// shortened for brevity
					"</ul>\n",
				title: null,
			}),
		};
		const wikiScraper = new WikiScraper(wikiApiClientMock as any);

		const enumPagePaths = await wikiScraper.getPagesInCategory("enum");

		expect(wikiApiClientMock.renderText).toHaveBeenCalledOnce();
		expect(enumPagePaths).toEqual(
			expect.arrayContaining([
				"/gmod/Enums/_USE",
				"/gmod/Enums/ACT",
				"/gmod/Enums/AIMR",
				"/gmod/Enums/AMMO",
				"/gmod/Enums/ANALOG",
				"/gmod/Enums/BLEND",
				"/gmod/Enums/BLENDFUNC",
				"/gmod/Enums/BLOOD_COLOR",
			]),
		);
	});

	it("builds the class for a wiki page", () => {
		const wikiPages: Array<WikiPage> = [
			{
				title: "Angle",
				content:
					"# Angle\r\n" +
					"\r\n" +
					'<type name="Angle" category="classfunc" is="class">\r\n' +
					"\t<summary>\r\n" +
					"\r\n" +
					"\t\tList of all possible functions to manipulate angles.\r\n" +
					"\r\n" +
					"\t\tCreated by <page>Global.Angle</page>.\r\n" +
					"\r\n" +
					"\t\t| Type                | Name                                 | Description                      |\r\n" +
					"\t\t| ------------------- | ------------------------------------ | -------------------------------- |\r\n" +
					"\t\t| <page>number</page> | `p` or `pitch` or `x` or `1` | The pitch component of the angle. |\r\n" +
					"\t\t| <page>number</page> | `y` or `yaw` or `y` or `2` | The yaw component of the angle. |\r\n" +
					"\t\t| <page>number</page> | `r` or `roll`  or `z` or `3` | The roll  component of the angle. |\r\n" +
					"\r\n" +
					"\t\tMetamethod | Second Operand | Description\r\n" +
					"\t\t---------- | -------------- | -----------\r\n" +
					"\t\t`__add` | <page>Angle</page> | Returns new <page>Angle</page> with the result of addition.\r\n" +
					"\t\t`__div` | <page>number</page> | Returns new <page>Angle</page> with the result of division.\r\n" +
					"\t\t`__eq` | <page>any</page> | Compares 2 operands, if they both are <page>Angle</page>, compares each individual component. <br/>Doesn't normalize the angles (360 is not equal to 0).\r\n" +
					"\t\t`__index` | <page>number</page> or <page>string</page> | Gets the component of the <page>Angle</page>. Returns a <page>number</page>.\r\n" +
					"\t\t`__mul` | <page>number</page> | Returns new <page>Angle</page> with the result of multiplication.\r\n" +
					"\t\t`__newindex` | <page>number</page> or <page>string</page> | Sets the component of the <page>Angle</page>. Accepts <page>number</page> and <page>string</page>.\r\n" +
					"\t\t`__sub` | <page>Angle</page> | Returns new <page>Angle</page> with the result of subtraction.\r\n" +
					"\t\t`__tostring` | | Returns `p y r`.\r\n" +
					"\t\t`__unm` | | Returns new <page>Angle</page> with the result of negation.\r\n" +
					"\r\n" +
					"\t</summary>\r\n" +
					"</type>\r\n",
				// shortened for brevity
			},
			{
				title: "Angle:Add",
				content:
					'<function name="Add" parent="Angle" type="classfunc">\r\n' +
					"\t<description>Adds the values of the argument angle to the orignal angle. \r\n" +
					"\r\n" +
					"This functions the same as angle1 + angle2 without creating a new angle object, skipping object construction and garbage collection.</description>\r\n" +
					"\t<realm>Shared and Menu</realm>\r\n" +
					"\t<args>\r\n" +
					'\t\t<arg name="angle" type="Angle">The angle to add.</arg>\r\n' +
					"\t</args>\r\n" +
					"</function>\r\n" +
					"\r\n",
			},
		];

		const classes = wikiScraper.buildClasses(wikiPages);
		const angleClass = classes[0];

		expect(classes.length).toBe(1);
		expect(angleClass.name).toBe("Angle");
		expect(angleClass.description).toContain(
			"List of all possible functions to manipulate angles",
		);
		expect(angleClass.functions?.length).toBe(1);
		expect(angleClass.functions?.[0].name).toBe("Add");
		expect(angleClass.functions?.[0].parent).toBe("Angle");
		expect(angleClass.functions?.[0].realms).toEqual(
			expect.arrayContaining(["client", "server", "menu"]),
		);
		expect(angleClass.functions?.[0].arguments).toEqual([
			{ name: "angle", type: "Angle", description: "The angle to add." },
		]);
		expect(angleClass.functions?.[0].description).toContain(
			"Adds the values of the argument angle to the orignal angle.",
		);
	});
});
