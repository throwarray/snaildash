local handlers = {}
local RegistrationErrors = {
	[1] = 'Form failed validation.', -- Error: failed validation
	[2] = 'Email is already in use.', -- Error: Email in use
	[3] = 'Failed to save user.', -- Error: Failed to save user
	[4] = 'License is registered already.', -- Error: Already registered
}

local function CreatePeer ()
	Wait(0)

	print('CREATE NEW PEER')

	local peerId = exports['simple-peer']:NUIWrapper(function (id, dispatch, setHandler)
		local connected

		local replies = {
			data = function (action)
				connected = true
				-- print('simple-peer:data')
			end,
			close = function ()
				connected = false
				print('simple-peer:close')
			end,
			-- FIXME Doesn't trigger
			connect = function ()
				connected = true
				print('simple-peer:connect')
			end,
			error = function ()
				connected = false -- NOTE
				print('simple-peer:error')
			end,
			signal = function (action)
				print('simple-peer:signal', action.payload)
				if not connected then
					TriggerServerEvent('snaildash:Remote', action.payload)
				end
			end,
		}

		setHandler(function (action)
			local listener = replies[action and action.type]

			if listener then
				listener(action)
			end
		end)

		RegisterNetEvent('snaildash:Remote')
		AddEventHandler('snaildash:Remote', function (data)
			dispatch({ type = 'connect', payload = data })
		end)

		dispatch({ type = 'open' }, function (action)
			local payload = action.payload
		end)

		Citizen.CreateThread(function ()
			local prev
			local disposed

			while not disposed do
				if connected then
					if not prev then
						prev = true
						dispatch({
							type = 'send',
							payload = { type = 'connect', payload = 'Welcome' }
						})
					end

					dispatch({
						type = 'send',
						payload = {
							type = 'stats',
							payload = {
								health = GetEntityHealth(PlayerPedId())
							}
						}
					})

				else
					if prev then
						prev = false
						disposed = true
					end
				end

				Wait(100)
			end

			return Citizen.CreateThread(CreatePeer)
		end)
	end)
end

local function DisplayHelpText(text)
	AddTextEntry('MEOW_IM_A_KID', text)
	BeginTextCommandDisplayHelp('MEOW_IM_A_KID')
	EndTextCommandDisplayHelp(0,0,1,5000)
end

RegisterNetEvent('snaildash:Welcome')
RegisterNetEvent('snaildash:Register')
RegisterNetEvent('snaildash:Verify')

AddEventHandler('snaildash:Welcome', function (registered, verified)
	-- Client is registered already
	if registered then IsRegistered(verified)

	-- Client should register
	elseif not handlers.register then
		handlers.register = AddEventHandler('snaildash:Register', function (err, verified)
			if err and err ~= 4 then
				print(RegistrationErrors[err] or RegistrationErrors[1])

				return
			end

			IsRegistered()

			if verified then
				IsVerified()
			end
		end)
	end

	-- Client is verified already
	if verified then IsVerified()

	-- Client should verify
	elseif not handlers.verify then
		handlers.verify = AddEventHandler('snaildash:Verify', function (err, verified)
			if not err then
				IsVerified()
			end
		end)
	end

	-- Received welcome event
	onWelcome(registered, verified)
end)

<<<<<<< HEAD
RegisterCommand("snail-register", function()
		SendNUIMessage({start=true})
		SetNuiFocus(true, true)
end, false)

--------------------------------------------------------------------------------
=======
>>>>>>> 96b039a5f7b8781418d0c1ec7b8a5c8b96d66638

local nuiOpen = false
local isReady = false

function focusNUI (show)
	nuiOpen = show == true
	SetNuiFocus(nuiOpen, nuiOpen)
	SendNUIMessage({ type = 'show', payload = nuiOpen })
end

RegisterCommand("snail-register", function()
	if not isReady and not nuiOpen then
		focusNUI(true)
	end
end, false)

RegisterNUICallback('onmessage', function (action)
	if action and action.type == 'register' then
		local payload = action.payload

		TriggerServerEvent('snaildash:Register', payload.email, payload.password)
		focusNUI(false)
	end
end)

--------------------------------------------------------------------------------

function onWelcome (registered, verified)
	if not registered and not verified then
<<<<<<< HEAD
		-- TriggerServerEvent('snaildash:Register', 'bob@gmail.com', '123456')
		CreateThread(function()
			while not registered then
				DisplayHelpText("Hi! looks like you still aren't registered on snaildash! let's fix that, type /snail-register in chat!")
				Wait(120000)
=======
		CreateThread(function()
			while not registered do
				DisplayHelpText("Hi! looks like you still aren't registered on snaildash! let's fix that, type /snail-register in chat!")
				Wait(60000)
>>>>>>> 96b039a5f7b8781418d0c1ec7b8a5c8b96d66638
			end
		end)
	end
end

function IsRegistered (verified)
	RegisterCommand("snail-register",function()end,true)
	if not verified then
		DisplayHelpText("You're just a step away from using your new snaildash account! Please check your email inbox and verify your account.")
	end
end

function IsVerified ()
	if not isReady then
		isReady = true

		-- Client is registered and verified, open the webrtc channel
		Citizen.CreateThread(CreatePeer)
	end
end
